---
title: "OpenCog Cognitive Architecture"
summary: "Overview of the OpenCog AGI cognitive architecture implementation"
read_when:
  - You want to understand the cognitive architecture components
  - You're implementing knowledge graph features
  - You need semantic reasoning capabilities
---

# OpenCog Cognitive Architecture

The OpenCog cognitive architecture provides a powerful knowledge representation and reasoning system inspired by the classical [OpenCog](https://opencog.org/) AGI framework. It enables the personal AI assistant to maintain structured knowledge, perform pattern matching, and reason about relationships.

## Core Components

### AtomSpace

The **AtomSpace** is a hypergraph knowledge representation system. It stores knowledge as a network of **Atoms** (nodes and links) that can represent concepts, relationships, and logical structures.

```typescript
import { AtomSpace, AtomType } from "@/cognitive";

const atomspace = new AtomSpace();

// Create concept nodes
const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "Cat");
const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "Animal");

// Create an inheritance relationship
const link = atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, animal.id]);
```

### Atom Types

#### Nodes (Vertices)

- **ConceptNode**: Represents concepts, entities, or objects
- **PredicateNode**: Represents properties or relations
- **VariableNode**: Used in pattern matching for unbound variables
- **NumberNode**: Stores numeric values
- **SchemaNode**: Represents procedures or functions

#### Links (Edges)

- **InheritanceLink**: Represents "is-a" relationships
- **SimilarityLink**: Represents semantic similarity
- **MemberLink**: Represents set membership
- **EvaluationLink**: Evaluates predicates on arguments
- **ListLink**: Groups atoms together
- **Logic Links**: AndLink, OrLink, NotLink, ImplicationLink, EquivalenceLink

### Truth Values

Each atom can have an associated **truth value** representing uncertain knowledge:

```typescript
import { TruthValueHelpers } from "@/cognitive";

// Create a truth value with 80% strength, 90% confidence
const tv = TruthValueHelpers.create(0.8, 0.9);

const node = atomspace.addNode(AtomType.CONCEPT_NODE, "Dog", tv);

// Merge truth values from multiple sources
const merged = TruthValueHelpers.merge(tv1, tv2);
```

Truth values consist of:

- **Strength** (0-1): Probability or degree of truth
- **Confidence** (0-1): Certainty in the strength value

### Attention Values

For Economic Attention Networks (ECAN), atoms can have **attention values**:

```typescript
import { AttentionValueHelpers } from "@/cognitive";

const av = AttentionValueHelpers.create(
  100, // STI: Short-term importance
  50, // LTI: Long-term importance
  true, // VLTI: Very long-term importance flag
);

atomspace.updateAttention(atomId, av);
```

## Pattern Matching

The **Pattern Matcher** enables querying and reasoning about knowledge in the AtomSpace:

### Basic Queries

```typescript
import { PatternMatcher } from "@/cognitive";

const matcher = new PatternMatcher(atomspace);

// Find all animals that inherit from "Mammal"
const mammal = atomspace.getNode(AtomType.CONCEPT_NODE, "Mammal");
const animals = matcher.findInheritanceSources(mammal.id);

// Find all superclasses (transitive)
const superclasses = matcher.findAllSuperclasses(cat.id);
// Returns: ["Mammal", "Animal", ...]
```

### Pattern Matching with Variables

```typescript
// Find all X where (Inheritance X Animal)
const pattern = {
  type: AtomType.INHERITANCE_LINK,
  outgoing: [
    {
      type: AtomType.CONCEPT_NODE,
      name: "$X",
      isVariable: true,
    },
    {
      type: AtomType.CONCEPT_NODE,
      name: "Animal",
      isVariable: false,
    },
  ],
};

const results = matcher.match(pattern);
// Results contain bindings: { "$X": "Cat" }, { "$X": "Dog" }, etc.
```

### Predicate Evaluation

```typescript
// Represent: John likes Mary
const john = atomspace.addNode(AtomType.CONCEPT_NODE, "John");
const mary = atomspace.addNode(AtomType.CONCEPT_NODE, "Mary");
const likes = atomspace.addNode(AtomType.PREDICATE_NODE, "likes");

const listLink = atomspace.addLink(AtomType.LIST_LINK, [john.id, mary.id]);
atomspace.addLink(AtomType.EVALUATION_LINK, [likes.id, listLink.id]);

// Query: Does John like Mary?
const result = matcher.evaluatePredicate("likes", [john.id, mary.id]);
console.log(result.found); // true
console.log(result.truthValue); // { strength: 0.5, confidence: 0 }
```

## Use Cases

### Knowledge Graph

Build a structured knowledge graph for your assistant:

```typescript
// Create a simple ontology
const vehicle = atomspace.addNode(AtomType.CONCEPT_NODE, "Vehicle");
const car = atomspace.addNode(AtomType.CONCEPT_NODE, "Car");
const bicycle = atomspace.addNode(AtomType.CONCEPT_NODE, "Bicycle");

atomspace.addLink(AtomType.INHERITANCE_LINK, [car.id, vehicle.id]);
atomspace.addLink(AtomType.INHERITANCE_LINK, [bicycle.id, vehicle.id]);

// Add properties
const hasWheels = atomspace.addNode(AtomType.PREDICATE_NODE, "hasWheels");
const fourNode = atomspace.addNode(AtomType.NUMBER_NODE, "4", undefined, 4);

const list = atomspace.addLink(AtomType.LIST_LINK, [car.id, fourNode.id]);
atomspace.addLink(AtomType.EVALUATION_LINK, [hasWheels.id, list.id]);
```

### Semantic Search

Query relationships and traverse the knowledge graph:

```typescript
// Find all predicates that apply to an entity
const predicates = matcher.findPredicatesFor(john.id);
// Returns: [{ predicate: "likes", args: ["John", "Mary"], truthValue: {...} }]

// Transitive closure - find all ancestors
const allParents = matcher.findAllSuperclasses(siamese.id);
// Returns: ["Cat", "Mammal", "Animal"]
```

### Reasoning

Combine pattern matching with logic:

```typescript
// Create logical expressions
const healthy = atomspace.addNode(AtomType.CONCEPT_NODE, "Healthy");
const exercises = atomspace.addNode(AtomType.CONCEPT_NODE, "Exercises");

// Implication: If X exercises, then X is healthy
const varX = atomspace.addNode(AtomType.VARIABLE_NODE, "$X");
atomspace.addLink(AtomType.IMPLICATION_LINK, [exercises.id, healthy.id]);
```

## Integration with Memory System

The cognitive architecture complements the existing memory system (`src/memory/`):

- **Memory System**: Stores conversation history, user preferences, and session data
- **Cognitive Architecture**: Provides structured knowledge representation and reasoning

Future work will integrate these systems to enable:

- Knowledge extraction from conversations
- Semantic search across memory and knowledge graph
- Reasoning about user preferences and context

## Performance Considerations

- AtomSpace maintains efficient indexes for node and link lookup (O(1) average case)
- Pattern matching performance depends on query complexity and graph size
- For large knowledge graphs (>100K atoms), consider:
  - Using more specific patterns to reduce search space
  - Implementing attention allocation to focus on relevant atoms
  - Periodic cleanup of low-attention atoms

## API Reference

See the TypeScript definitions in:

- `src/cognitive/atom-types.ts` - Core type definitions
- `src/cognitive/atomspace.ts` - AtomSpace implementation
- `src/cognitive/pattern-matcher.ts` - Pattern matching

## Further Reading

- [OpenCog Wiki](https://wiki.opencog.org/) - Original OpenCog documentation
- [AtomSpace Design](https://wiki.opencog.org/w/AtomSpace) - AtomSpace concepts
- [Pattern Matcher](https://wiki.opencog.org/w/Pattern_Matcher) - Pattern matching in OpenCog
- [PLN](https://wiki.opencog.org/w/PLN) - Probabilistic Logic Networks (future work)

## Limitations

Current implementation provides:

- ✅ Basic AtomSpace with hypergraph storage
- ✅ Pattern matching with variable unification
- ✅ Truth values for uncertain knowledge
- ✅ Attention values (ECAN ready)

Not yet implemented:

- ❌ Probabilistic Logic Networks (PLN) inference
- ❌ Attention allocation dynamics
- ❌ Persistence to disk
- ❌ Distributed AtomSpace
- ❌ Advanced pattern matching features (glob, choice, etc.)
