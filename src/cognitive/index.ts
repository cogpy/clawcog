/**
 * OpenCog AGI Cognitive Architecture
 *
 * This module implements core cognitive architecture components inspired by
 * the classical OpenCog AGI framework:
 *
 * - AtomSpace: Hypergraph knowledge representation
 * - Pattern Matcher: Query and unification engine
 * - Truth Values: Uncertain knowledge representation
 * - Attention Values: Economic attention allocation (ECAN)
 *
 * @module cognitive
 */

export {
  AtomType,
  TruthValueHelpers,
  AttentionValueHelpers,
  isNode,
  isLink,
  type Atom,
  type Node,
  type Link,
  type TruthValue,
  type AttentionValue,
} from "./atom-types.js";

export { AtomSpace, type AtomSpaceOptions, type AtomQuery } from "./atomspace.js";

export {
  PatternMatcher,
  type Binding,
  type MatchResult,
  type Pattern,
  type PatternNode,
  type PatternLink,
} from "./pattern-matcher.js";
