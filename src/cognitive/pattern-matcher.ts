/**
 * Pattern Matcher - Query and unify patterns in the AtomSpace
 *
 * Implements basic pattern matching and variable unification
 * for querying the hypergraph knowledge base.
 */

import type { Atom, Node, TruthValue } from "./atom-types.js";
import type { AtomSpace } from "./atomspace.js";
import { AtomType, isLink, isNode } from "./atom-types.js";

/**
 * Variable binding from pattern matching
 */
export interface Binding {
  variable: string; // Variable name (e.g., "$X")
  atomId: string; // Bound atom ID
}

/**
 * Pattern matching result
 */
export interface MatchResult {
  bindings: Map<string, string>; // variable name -> atom ID
  matched: boolean;
}

/**
 * Pattern element (can be concrete or variable)
 */
export interface PatternNode {
  type: AtomType;
  name: string;
  isVariable: boolean;
}

export interface PatternLink {
  type: AtomType;
  outgoing: (PatternNode | PatternLink)[];
}

export type Pattern = PatternNode | PatternLink;

/**
 * Pattern Matcher class
 */
export class PatternMatcher {
  constructor(private readonly atomspace: AtomSpace) {}

  /**
   * Match a pattern against the AtomSpace
   * Returns all possible bindings that satisfy the pattern
   */
  match(pattern: Pattern): MatchResult[] {
    const results: MatchResult[] = [];
    const allAtoms = this.atomspace.getAllAtoms();

    for (const atom of allAtoms) {
      const bindings = new Map<string, string>();
      if (this.matchPattern(pattern, atom, bindings)) {
        results.push({
          bindings,
          matched: true,
        });
      }
    }

    return results;
  }

  /**
   * Match a pattern element against an atom with current bindings
   */
  private matchPattern(pattern: Pattern, atom: Atom, bindings: Map<string, string>): boolean {
    if (this.isPatternNode(pattern)) {
      return this.matchPatternNode(pattern, atom, bindings);
    } else {
      return this.matchPatternLink(pattern, atom, bindings);
    }
  }

  /**
   * Match a pattern node
   */
  private matchPatternNode(
    pattern: PatternNode,
    atom: Atom,
    bindings: Map<string, string>,
  ): boolean {
    if (!isNode(atom)) {
      return false;
    }

    // Check type compatibility
    if (pattern.type !== AtomType.NODE && pattern.type !== atom.type) {
      return false;
    }

    if (pattern.isVariable) {
      // Variable pattern
      const varName = pattern.name;

      // Check if variable already bound
      if (bindings.has(varName)) {
        return bindings.get(varName) === atom.id;
      }

      // Bind variable to this atom
      bindings.set(varName, atom.id);
      return true;
    } else {
      // Concrete node pattern
      return atom.name === pattern.name;
    }
  }

  /**
   * Match a pattern link
   */
  private matchPatternLink(
    pattern: PatternLink,
    atom: Atom,
    bindings: Map<string, string>,
  ): boolean {
    if (!isLink(atom)) {
      return false;
    }

    // Check type compatibility
    if (pattern.type !== AtomType.LINK && pattern.type !== atom.type) {
      return false;
    }

    // Check arity
    if (pattern.outgoing.length !== atom.outgoing.length) {
      return false;
    }

    // Try to match each outgoing atom
    const newBindings = new Map(bindings);

    for (let i = 0; i < pattern.outgoing.length; i++) {
      const patternOut = pattern.outgoing[i];
      const atomOut = this.atomspace.getAtom(atom.outgoing[i]);

      if (!atomOut) {
        return false;
      }

      if (!this.matchPattern(patternOut, atomOut, newBindings)) {
        return false;
      }
    }

    // All matched - update original bindings
    for (const [key, value] of newBindings) {
      bindings.set(key, value);
    }

    return true;
  }

  /**
   * Type guard for pattern node
   */
  private isPatternNode(pattern: Pattern): pattern is PatternNode {
    return "isVariable" in pattern;
  }

  /**
   * Find all atoms matching a simple query
   * Example: Find all X where (Inheritance X Animal)
   */
  findInheritanceTargets(sourceId: string): Node[] {
    const incoming = this.atomspace.getIncoming(sourceId);
    const results: Node[] = [];

    for (const link of incoming) {
      if (link.type === AtomType.INHERITANCE_LINK && link.outgoing.length === 2) {
        if (link.outgoing[0] === sourceId) {
          const target = this.atomspace.getAtom(link.outgoing[1]);
          if (target && isNode(target)) {
            results.push(target);
          }
        }
      }
    }

    return results;
  }

  /**
   * Find all atoms inheriting from a target
   * Example: Find all X where (Inheritance X Cat)
   */
  findInheritanceSources(targetId: string): Node[] {
    const incoming = this.atomspace.getIncoming(targetId);
    const results: Node[] = [];

    for (const link of incoming) {
      if (link.type === AtomType.INHERITANCE_LINK && link.outgoing.length === 2) {
        if (link.outgoing[1] === targetId) {
          const source = this.atomspace.getAtom(link.outgoing[0]);
          if (source && isNode(source)) {
            results.push(source);
          }
        }
      }
    }

    return results;
  }

  /**
   * Evaluate a predicate on arguments
   * Example: Check if (Evaluation (Predicate "likes") (List John Mary)) exists
   */
  evaluatePredicate(
    predicateName: string,
    args: string[],
  ): { found: boolean; truthValue?: TruthValue } {
    const predicateNode = this.atomspace.getNode(AtomType.PREDICATE_NODE, predicateName);
    if (!predicateNode) {
      return { found: false };
    }

    // Find list link with these arguments
    const listLink = this.atomspace.getLink(AtomType.LIST_LINK, args);
    if (!listLink) {
      return { found: false };
    }

    // Find evaluation link
    const evalLink = this.atomspace.getLink(AtomType.EVALUATION_LINK, [
      predicateNode.id,
      listLink.id,
    ]);

    if (!evalLink) {
      return { found: false };
    }

    return {
      found: true,
      truthValue: evalLink.truthValue,
    };
  }

  /**
   * Find all predicates that apply to a given entity
   */
  findPredicatesFor(entityId: string): Array<{
    predicate: Node;
    args: Node[];
    truthValue: TruthValue | undefined;
  }> {
    const results: Array<{
      predicate: Node;
      args: Node[];
      truthValue: TruthValue | undefined;
    }> = [];

    // Find all list links containing this entity
    const atom = this.atomspace.getAtom(entityId);
    if (!atom) {
      return results;
    }

    const incoming = this.atomspace.getIncoming(entityId);

    for (const link of incoming) {
      if (link.type === AtomType.LIST_LINK) {
        // Check if this list is part of an evaluation
        const evalLinks = this.atomspace.getIncoming(link.id);

        for (const evalLink of evalLinks) {
          if (evalLink.type === AtomType.EVALUATION_LINK && evalLink.outgoing.length === 2) {
            const predicateAtom = this.atomspace.getAtom(evalLink.outgoing[0]);
            if (predicateAtom && isNode(predicateAtom)) {
              const args = this.atomspace.getOutgoing(link.id).filter(isNode);

              results.push({
                predicate: predicateAtom,
                args,
                truthValue: evalLink.truthValue,
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Transitive closure of inheritance
   * Find all superclasses of a concept (direct and indirect)
   */
  findAllSuperclasses(conceptId: string): Node[] {
    const visited = new Set<string>();
    const result: Node[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) {
        return;
      }
      visited.add(id);

      const parents = this.findInheritanceTargets(id);
      for (const parent of parents) {
        result.push(parent);
        traverse(parent.id);
      }
    };

    traverse(conceptId);
    return result;
  }

  /**
   * Transitive closure of inheritance (downward)
   * Find all subclasses of a concept (direct and indirect)
   */
  findAllSubclasses(conceptId: string): Node[] {
    const visited = new Set<string>();
    const result: Node[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) {
        return;
      }
      visited.add(id);

      const children = this.findInheritanceSources(id);
      for (const child of children) {
        result.push(child);
        traverse(child.id);
      }
    };

    traverse(conceptId);
    return result;
  }
}
