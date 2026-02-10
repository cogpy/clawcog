/**
 * Atom type definitions for OpenCog cognitive architecture
 *
 * Atoms are the fundamental units in the AtomSpace hypergraph.
 * They come in two main varieties: Nodes (vertices) and Links (edges).
 */

export enum AtomType {
  // Base types
  ATOM = "Atom",
  NODE = "Node",
  LINK = "Link",

  // Node types
  CONCEPT_NODE = "ConceptNode",
  PREDICATE_NODE = "PredicateNode",
  VARIABLE_NODE = "VariableNode",
  NUMBER_NODE = "NumberNode",
  SCHEMA_NODE = "SchemaNode",

  // Link types
  INHERITANCE_LINK = "InheritanceLink",
  SIMILARITY_LINK = "SimilarityLink",
  MEMBER_LINK = "MemberLink",
  EVALUATION_LINK = "EvaluationLink",
  LIST_LINK = "ListLink",
  AND_LINK = "AndLink",
  OR_LINK = "OrLink",
  NOT_LINK = "NotLink",
  IMPLICATION_LINK = "ImplicationLink",
  EQUIVALENCE_LINK = "EquivalenceLink",
  EXECUTION_LINK = "ExecutionLink",
}

/**
 * Truth value representing uncertain knowledge
 * Using Simple Truth Value with strength and confidence
 */
export interface TruthValue {
  strength: number; // [0, 1] - probability/degree of truth
  confidence: number; // [0, 1] - certainty in the strength value
}

/**
 * Attention value for ECAN (Economic Attention Networks)
 */
export interface AttentionValue {
  sti: number; // Short-term importance
  lti: number; // Long-term importance
  vlti: boolean; // Very long-term importance flag
}

/**
 * Base Atom interface
 */
export interface Atom {
  id: string;
  type: AtomType;
  truthValue?: TruthValue;
  attentionValue?: AttentionValue;
  timestamp: number;
}

/**
 * Node - represents a concept, entity, or value
 */
export interface Node extends Atom {
  type:
    | AtomType.NODE
    | AtomType.CONCEPT_NODE
    | AtomType.PREDICATE_NODE
    | AtomType.VARIABLE_NODE
    | AtomType.NUMBER_NODE
    | AtomType.SCHEMA_NODE;
  name: string;
  value?: string | number | boolean;
}

/**
 * Link - represents a relationship between atoms
 */
export interface Link extends Atom {
  type:
    | AtomType.LINK
    | AtomType.INHERITANCE_LINK
    | AtomType.SIMILARITY_LINK
    | AtomType.MEMBER_LINK
    | AtomType.EVALUATION_LINK
    | AtomType.LIST_LINK
    | AtomType.AND_LINK
    | AtomType.OR_LINK
    | AtomType.NOT_LINK
    | AtomType.IMPLICATION_LINK
    | AtomType.EQUIVALENCE_LINK
    | AtomType.EXECUTION_LINK;
  outgoing: string[]; // IDs of connected atoms
}

/**
 * Helper functions for truth values
 */
export const TruthValueHelpers = {
  /**
   * Create a simple truth value
   */
  create(strength: number, confidence: number): TruthValue {
    return {
      strength: Math.max(0, Math.min(1, strength)),
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  },

  /**
   * Default truth value (unknown)
   */
  unknown(): TruthValue {
    return { strength: 0.5, confidence: 0 };
  },

  /**
   * Certain true
   */
  true(): TruthValue {
    return { strength: 1, confidence: 1 };
  },

  /**
   * Certain false
   */
  false(): TruthValue {
    return { strength: 0, confidence: 1 };
  },

  /**
   * Merge two truth values using weighted average
   */
  merge(tv1: TruthValue, tv2: TruthValue): TruthValue {
    const totalConf = tv1.confidence + tv2.confidence;
    if (totalConf === 0) {
      return this.unknown();
    }
    const strength = (tv1.strength * tv1.confidence + tv2.strength * tv2.confidence) / totalConf;
    const confidence = Math.min(1, totalConf);
    return { strength, confidence };
  },

  /**
   * Compare truth values for equality
   */
  equals(tv1: TruthValue, tv2: TruthValue, epsilon = 0.0001): boolean {
    return (
      Math.abs(tv1.strength - tv2.strength) < epsilon &&
      Math.abs(tv1.confidence - tv2.confidence) < epsilon
    );
  },
};

/**
 * Helper functions for attention values
 */
export const AttentionValueHelpers = {
  /**
   * Create an attention value
   */
  create(sti = 0, lti = 0, vlti = false): AttentionValue {
    return { sti, lti, vlti };
  },

  /**
   * Default attention value
   */
  default(): AttentionValue {
    return { sti: 0, lti: 0, vlti: false };
  },
};

/**
 * Type guards
 */
export const isNode = (atom: Atom): atom is Node => {
  return (
    atom.type === AtomType.NODE ||
    atom.type === AtomType.CONCEPT_NODE ||
    atom.type === AtomType.PREDICATE_NODE ||
    atom.type === AtomType.VARIABLE_NODE ||
    atom.type === AtomType.NUMBER_NODE ||
    atom.type === AtomType.SCHEMA_NODE
  );
};

export const isLink = (atom: Atom): atom is Link => {
  return !isNode(atom);
};
