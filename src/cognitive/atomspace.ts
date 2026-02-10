/**
 * AtomSpace - Core hypergraph knowledge representation
 *
 * The AtomSpace is the primary knowledge store in OpenCog.
 * It maintains a hypergraph of Atoms (Nodes and Links).
 */

import { randomUUID } from "node:crypto";
import type { Atom, AttentionValue, Link, Node, TruthValue } from "./atom-types.js";
import {
  AtomType,
  AttentionValueHelpers,
  TruthValueHelpers,
  isLink,
  isNode,
} from "./atom-types.js";

/**
 * AtomSpace configuration options
 */
export interface AtomSpaceOptions {
  maxSize?: number; // Maximum number of atoms
  enableAttention?: boolean; // Enable attention allocation
}

/**
 * Query result for atom lookups
 */
export interface AtomQuery {
  type?: AtomType;
  name?: string;
  outgoing?: string[];
}

/**
 * AtomSpace class - manages the hypergraph knowledge base
 */
export class AtomSpace {
  private atoms: Map<string, Atom>;
  private nodeIndex: Map<string, string>; // name -> id
  private linkIndex: Map<string, Set<string>>; // outgoing hash -> ids
  private incomingIndex: Map<string, Set<string>>; // atom id -> incoming link ids
  private readonly options: Required<AtomSpaceOptions>;

  constructor(options: AtomSpaceOptions = {}) {
    this.atoms = new Map();
    this.nodeIndex = new Map();
    this.linkIndex = new Map();
    this.incomingIndex = new Map();
    this.options = {
      maxSize: options.maxSize ?? 1_000_000,
      enableAttention: options.enableAttention ?? true,
    };
  }

  /**
   * Add or update a node in the AtomSpace
   */
  addNode(
    type: AtomType,
    name: string,
    truthValue?: TruthValue,
    value?: string | number | boolean,
  ): Node {
    // Check if node already exists
    const indexKey = this.getNodeIndexKey(type, name);
    const existingId = this.nodeIndex.get(indexKey);

    if (existingId) {
      const existing = this.atoms.get(existingId) as Node;
      // Update truth value if provided
      if (truthValue && existing.truthValue) {
        existing.truthValue = TruthValueHelpers.merge(existing.truthValue, truthValue);
      } else if (truthValue) {
        existing.truthValue = truthValue;
      }
      if (value !== undefined) {
        existing.value = value;
      }
      return existing;
    }

    // Create new node
    const id = randomUUID();
    const node: Node = {
      id,
      type,
      name,
      value,
      truthValue: truthValue ?? TruthValueHelpers.unknown(),
      attentionValue: this.options.enableAttention ? AttentionValueHelpers.default() : undefined,
      timestamp: Date.now(),
    };

    this.atoms.set(id, node);
    this.nodeIndex.set(indexKey, id);
    this.incomingIndex.set(id, new Set());

    return node;
  }

  /**
   * Add or update a link in the AtomSpace
   */
  addLink(type: AtomType, outgoing: string[], truthValue?: TruthValue): Link {
    // Validate outgoing atoms exist
    for (const atomId of outgoing) {
      if (!this.atoms.has(atomId)) {
        throw new Error(`Atom ${atomId} not found in AtomSpace`);
      }
    }

    // Check if link already exists
    const linkHash = this.getLinkHash(type, outgoing);
    const existingIds = this.linkIndex.get(linkHash);

    if (existingIds && existingIds.size > 0) {
      const existingId = [...existingIds][0];
      const existing = this.atoms.get(existingId) as Link;
      // Update truth value if provided
      if (truthValue && existing.truthValue) {
        existing.truthValue = TruthValueHelpers.merge(existing.truthValue, truthValue);
      } else if (truthValue) {
        existing.truthValue = truthValue;
      }
      return existing;
    }

    // Create new link
    const id = randomUUID();
    const link: Link = {
      id,
      type,
      outgoing,
      truthValue: truthValue ?? TruthValueHelpers.unknown(),
      attentionValue: this.options.enableAttention ? AttentionValueHelpers.default() : undefined,
      timestamp: Date.now(),
    };

    this.atoms.set(id, link);

    // Update indexes
    if (!this.linkIndex.has(linkHash)) {
      this.linkIndex.set(linkHash, new Set());
    }
    this.linkIndex.get(linkHash)!.add(id);

    // Update incoming index
    for (const atomId of outgoing) {
      if (!this.incomingIndex.has(atomId)) {
        this.incomingIndex.set(atomId, new Set());
      }
      this.incomingIndex.get(atomId)!.add(id);
    }

    return link;
  }

  /**
   * Get an atom by ID
   */
  getAtom(id: string): Atom | undefined {
    return this.atoms.get(id);
  }

  /**
   * Get a node by type and name
   */
  getNode(type: AtomType, name: string): Node | undefined {
    const indexKey = this.getNodeIndexKey(type, name);
    const id = this.nodeIndex.get(indexKey);
    return id ? (this.atoms.get(id) as Node) : undefined;
  }

  /**
   * Get all links with specific outgoing atoms
   */
  getLink(type: AtomType, outgoing: string[]): Link | undefined {
    const linkHash = this.getLinkHash(type, outgoing);
    const ids = this.linkIndex.get(linkHash);
    if (!ids || ids.size === 0) {
      return undefined;
    }
    const id = [...ids][0];
    return this.atoms.get(id) as Link;
  }

  /**
   * Get all incoming links to an atom
   */
  getIncoming(atomId: string): Link[] {
    const incomingIds = this.incomingIndex.get(atomId);
    if (!incomingIds) {
      return [];
    }
    return [...incomingIds]
      .map((id) => this.atoms.get(id))
      .filter((atom): atom is Link => !!atom && isLink(atom));
  }

  /**
   * Get all outgoing atoms from a link
   */
  getOutgoing(linkId: string): Atom[] {
    const link = this.atoms.get(linkId);
    if (!link || !isLink(link)) {
      return [];
    }
    return link.outgoing.map((id) => this.atoms.get(id)).filter((atom): atom is Atom => !!atom);
  }

  /**
   * Query atoms by criteria
   */
  query(criteria: AtomQuery): Atom[] {
    const results: Atom[] = [];

    for (const atom of this.atoms.values()) {
      if (criteria.type && atom.type !== criteria.type) {
        continue;
      }

      if (criteria.name && isNode(atom)) {
        if (atom.name !== criteria.name) {
          continue;
        }
      }

      if (criteria.outgoing && isLink(atom)) {
        if (!this.arraysEqual(atom.outgoing, criteria.outgoing)) {
          continue;
        }
      }

      results.push(atom);
    }

    return results;
  }

  /**
   * Delete an atom from the AtomSpace
   */
  deleteAtom(id: string): boolean {
    const atom = this.atoms.get(id);
    if (!atom) {
      return false;
    }

    // Remove from indexes
    if (isNode(atom)) {
      const indexKey = this.getNodeIndexKey(atom.type, atom.name);
      this.nodeIndex.delete(indexKey);
    } else if (isLink(atom)) {
      const linkHash = this.getLinkHash(atom.type, atom.outgoing);
      const ids = this.linkIndex.get(linkHash);
      if (ids) {
        ids.delete(id);
        if (ids.size === 0) {
          this.linkIndex.delete(linkHash);
        }
      }

      // Remove from incoming indexes
      for (const atomId of atom.outgoing) {
        const incoming = this.incomingIndex.get(atomId);
        if (incoming) {
          incoming.delete(id);
        }
      }
    }

    this.incomingIndex.delete(id);
    this.atoms.delete(id);

    return true;
  }

  /**
   * Clear all atoms from the AtomSpace
   */
  clear(): void {
    this.atoms.clear();
    this.nodeIndex.clear();
    this.linkIndex.clear();
    this.incomingIndex.clear();
  }

  /**
   * Get the number of atoms in the AtomSpace
   */
  size(): number {
    return this.atoms.size;
  }

  /**
   * Get all atoms
   */
  getAllAtoms(): Atom[] {
    return [...this.atoms.values()];
  }

  /**
   * Update attention value for an atom
   */
  updateAttention(atomId: string, attentionValue: AttentionValue): boolean {
    const atom = this.atoms.get(atomId);
    if (!atom) {
      return false;
    }
    atom.attentionValue = attentionValue;
    return true;
  }

  /**
   * Update truth value for an atom
   */
  updateTruthValue(atomId: string, truthValue: TruthValue): boolean {
    const atom = this.atoms.get(atomId);
    if (!atom) {
      return false;
    }
    atom.truthValue = truthValue;
    return true;
  }

  /**
   * Helper: Create node index key
   */
  private getNodeIndexKey(type: AtomType, name: string): string {
    return `${type}:${name}`;
  }

  /**
   * Helper: Create link hash
   */
  private getLinkHash(type: AtomType, outgoing: string[]): string {
    return `${type}:[${outgoing.join(",")}]`;
  }

  /**
   * Helper: Compare arrays for equality
   */
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
}
