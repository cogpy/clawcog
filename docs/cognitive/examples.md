---
title: "Cognitive Architecture Examples"
summary: "Practical examples of using the OpenCog cognitive architecture"
read_when:
  - You want to see working code examples
  - You're building knowledge-based features
---

# Cognitive Architecture Examples

This guide provides practical examples of using the OpenCog cognitive architecture in the personal AI assistant.

## Example 1: Building a Personal Knowledge Base

Create a personal knowledge base about the user's interests and preferences:

```typescript
import { AtomSpace, AtomType, TruthValueHelpers, PatternMatcher } from "@/cognitive";

// Initialize
const atomspace = new AtomSpace();
const matcher = new PatternMatcher(atomspace);

// Create concepts
const user = atomspace.addNode(AtomType.CONCEPT_NODE, "User");
const python = atomspace.addNode(AtomType.CONCEPT_NODE, "Python");
const javascript = atomspace.addNode(AtomType.CONCEPT_NODE, "JavaScript");
const programming = atomspace.addNode(AtomType.CONCEPT_NODE, "Programming");

// Create relationships
atomspace.addLink(AtomType.INHERITANCE_LINK, [python.id, programming.id]);
atomspace.addLink(AtomType.INHERITANCE_LINK, [javascript.id, programming.id]);

// Add preferences with certainty
const likes = atomspace.addNode(AtomType.PREDICATE_NODE, "likes");

const list1 = atomspace.addLink(AtomType.LIST_LINK, [user.id, python.id]);
atomspace.addLink(
  AtomType.EVALUATION_LINK,
  [likes.id, list1.id],
  TruthValueHelpers.create(0.9, 0.8), // High confidence user likes Python
);

const list2 = atomspace.addLink(AtomType.LIST_LINK, [user.id, javascript.id]);
atomspace.addLink(
  AtomType.EVALUATION_LINK,
  [likes.id, list2.id],
  TruthValueHelpers.create(0.6, 0.5), // Moderate confidence
);

// Query: What does the user like?
const userPreferences = matcher.findPredicatesFor(user.id);
console.log("User likes:", userPreferences);

// Query: What programming languages does the user like?
const programmingLangs = matcher.findAllSubclasses(programming.id);
console.log(
  "Programming languages:",
  programmingLangs.map((n) => n.name),
);
```

## Example 2: Semantic Search

Use pattern matching to find related knowledge:

```typescript
import { AtomSpace, AtomType, PatternMatcher } from "@/cognitive";

const atomspace = new AtomSpace();
const matcher = new PatternMatcher(atomspace);

// Build a simple ontology
function buildOntology() {
  // Animals
  const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "Animal");
  const mammal = atomspace.addNode(AtomType.CONCEPT_NODE, "Mammal");
  const bird = atomspace.addNode(AtomType.CONCEPT_NODE, "Bird");
  const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "Cat");
  const dog = atomspace.addNode(AtomType.CONCEPT_NODE, "Dog");
  const robin = atomspace.addNode(AtomType.CONCEPT_NODE, "Robin");

  atomspace.addLink(AtomType.INHERITANCE_LINK, [mammal.id, animal.id]);
  atomspace.addLink(AtomType.INHERITANCE_LINK, [bird.id, animal.id]);
  atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, mammal.id]);
  atomspace.addLink(AtomType.INHERITANCE_LINK, [dog.id, mammal.id]);
  atomspace.addLink(AtomType.INHERITANCE_LINK, [robin.id, bird.id]);

  // Abilities
  const canFly = atomspace.addNode(AtomType.PREDICATE_NODE, "canFly");
  const canSwim = atomspace.addNode(AtomType.PREDICATE_NODE, "canSwim");

  const list1 = atomspace.addLink(AtomType.LIST_LINK, [bird.id]);
  atomspace.addLink(AtomType.EVALUATION_LINK, [canFly.id, list1.id]);

  const list2 = atomspace.addLink(AtomType.LIST_LINK, [dog.id]);
  atomspace.addLink(AtomType.EVALUATION_LINK, [canSwim.id, list2.id]);
}

buildOntology();

// Search: Find all mammals
const mammal = atomspace.getNode(AtomType.CONCEPT_NODE, "Mammal");
const allMammals = matcher.findAllSubclasses(mammal!.id);
console.log(
  "All mammals:",
  allMammals.map((n) => n.name),
); // ["Cat", "Dog"]

// Search: What can a robin do?
const robin = atomspace.getNode(AtomType.CONCEPT_NODE, "Robin");
const superclasses = matcher.findAllSuperclasses(robin!.id);
console.log(
  "Robin is a:",
  superclasses.map((n) => n.name),
); // ["Bird", "Animal"]

// Check abilities
for (const cls of [robin, ...superclasses]) {
  const abilities = matcher.findPredicatesFor(cls.id);
  if (abilities.length > 0) {
    console.log(
      `${cls.name} abilities:`,
      abilities.map((a) => a.predicate.name),
    );
  }
}
```

## Example 3: Conversation Context

Store and query conversation context:

```typescript
import { AtomSpace, AtomType, TruthValueHelpers, PatternMatcher } from "@/cognitive";

const atomspace = new AtomSpace();
const matcher = new PatternMatcher(atomspace);

// Store conversation facts
function addConversationFact(
  subject: string,
  predicate: string,
  object: string,
  confidence: number,
) {
  const subj = atomspace.addNode(AtomType.CONCEPT_NODE, subject);
  const pred = atomspace.addNode(AtomType.PREDICATE_NODE, predicate);
  const obj = atomspace.addNode(AtomType.CONCEPT_NODE, object);

  const list = atomspace.addLink(AtomType.LIST_LINK, [subj.id, obj.id]);
  atomspace.addLink(
    AtomType.EVALUATION_LINK,
    [pred.id, list.id],
    TruthValueHelpers.create(0.8, confidence),
  );
}

// Example conversation:
// User: "I'm working on a project in Python"
addConversationFact("User", "workingOn", "Python-Project", 0.9);
addConversationFact("Python-Project", "uses", "Python", 0.95);

// User: "I need help with async/await"
addConversationFact("User", "needsHelp", "async-await", 0.85);
addConversationFact("async-await", "relatedTo", "Python", 0.7);

// Query context
const user = atomspace.getNode(AtomType.CONCEPT_NODE, "User")!;
const context = matcher.findPredicatesFor(user.id);

console.log("Current context:");
for (const ctx of context) {
  console.log(
    `- ${ctx.predicate.name}:`,
    ctx.args.map((a) => a.name),
  );
  console.log(`  Confidence: ${ctx.truthValue?.confidence}`);
}
```

## Example 4: Rules and Inference

Define logical rules for simple inference:

```typescript
import { AtomSpace, AtomType } from "@/cognitive";

const atomspace = new AtomSpace();

// Rule: If X is a mammal, then X is an animal
const mammal = atomspace.addNode(AtomType.CONCEPT_NODE, "Mammal");
const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "Animal");
atomspace.addLink(AtomType.IMPLICATION_LINK, [mammal.id, animal.id]);

// Rule: If X can fly AND X has feathers, then X is a bird
const canFly = atomspace.addNode(AtomType.PREDICATE_NODE, "canFly");
const hasFeathers = atomspace.addNode(AtomType.PREDICATE_NODE, "hasFeathers");
const bird = atomspace.addNode(AtomType.CONCEPT_NODE, "Bird");

const and1 = atomspace.addLink(AtomType.AND_LINK, [canFly.id, hasFeathers.id]);
atomspace.addLink(AtomType.IMPLICATION_LINK, [and1.id, bird.id]);

// Note: Actual inference execution requires PLN (not yet implemented)
// This shows the structure for future inference capabilities
```

## Example 5: Attention Allocation

Use attention values to prioritize important knowledge:

```typescript
import { AtomSpace, AtomType, AttentionValueHelpers } from "@/cognitive";

const atomspace = new AtomSpace({ enableAttention: true });

// Create knowledge
const important = atomspace.addNode(AtomType.CONCEPT_NODE, "ImportantTask");
const routine = atomspace.addNode(AtomType.CONCEPT_NODE, "RoutineTask");

// Set attention based on importance
atomspace.updateAttention(
  important.id,
  AttentionValueHelpers.create(
    100, // High STI - currently important
    80, // High LTI - long-term important
    true, // VLTI - should never be forgotten
  ),
);

atomspace.updateAttention(
  routine.id,
  AttentionValueHelpers.create(
    20, // Low STI - not urgent
    10, // Low LTI - can be forgotten
    false, // Not VLTI
  ),
);

// Query by attention (future: attention spreading algorithms)
const allAtoms = atomspace.getAllAtoms();
const highAttention = allAtoms
  .filter((a) => a.attentionValue && a.attentionValue.sti > 50)
  .sort((a, b) => (b.attentionValue?.sti || 0) - (a.attentionValue?.sti || 0));

console.log("High attention atoms:", highAttention);
```

## Example 6: Temporal Knowledge

Represent time-based knowledge:

```typescript
import { AtomSpace, AtomType, TruthValueHelpers } from "@/cognitive";

const atomspace = new AtomSpace();

// Create temporal concepts
const now = new Date().toISOString();
const event = atomspace.addNode(AtomType.CONCEPT_NODE, "Meeting");
const time = atomspace.addNode(AtomType.CONCEPT_NODE, now);

// Use predicates to represent temporal relationships
const occursAt = atomspace.addNode(AtomType.PREDICATE_NODE, "occursAt");
const list = atomspace.addLink(AtomType.LIST_LINK, [event.id, time.id]);
atomspace.addLink(
  AtomType.EVALUATION_LINK,
  [occursAt.id, list.id],
  TruthValueHelpers.create(1.0, 1.0), // Certain time
);

// Query events by time
function findEventsAt(timestamp: string) {
  const timeNode = atomspace.getNode(AtomType.CONCEPT_NODE, timestamp);
  if (!timeNode) return [];

  const occursAtNode = atomspace.getNode(AtomType.PREDICATE_NODE, "occursAt");
  if (!occursAtNode) return [];

  const incoming = atomspace.getIncoming(timeNode.id);
  const events = [];

  for (const link of incoming) {
    if (link.type === AtomType.LIST_LINK) {
      const evalLinks = atomspace.getIncoming(link.id);
      for (const evalLink of evalLinks) {
        if (evalLink.type === AtomType.EVALUATION_LINK) {
          const outgoing = atomspace.getOutgoing(evalLink.id);
          if (outgoing[0]?.id === occursAtNode.id) {
            const listOut = atomspace.getOutgoing(link.id);
            events.push(listOut[0]);
          }
        }
      }
    }
  }

  return events;
}
```

## Example 7: Multi-Modal Knowledge

Integrate different types of knowledge:

```typescript
import { AtomSpace, AtomType, TruthValueHelpers } from "@/cognitive";

const atomspace = new AtomSpace();

// Text knowledge
const document = atomspace.addNode(AtomType.CONCEPT_NODE, "Report2024");
const topic = atomspace.addNode(AtomType.CONCEPT_NODE, "AI-Safety");
const about = atomspace.addNode(AtomType.PREDICATE_NODE, "about");

const list1 = atomspace.addLink(AtomType.LIST_LINK, [document.id, topic.id]);
atomspace.addLink(AtomType.EVALUATION_LINK, [about.id, list1.id]);

// Numeric knowledge
const score = atomspace.addNode(AtomType.NUMBER_NODE, "confidence", undefined, 0.85);
const hasScore = atomspace.addNode(AtomType.PREDICATE_NODE, "hasScore");

const list2 = atomspace.addLink(AtomType.LIST_LINK, [document.id, score.id]);
atomspace.addLink(AtomType.EVALUATION_LINK, [hasScore.id, list2.id]);

// Relationships between entities
const author = atomspace.addNode(AtomType.CONCEPT_NODE, "Dr-Smith");
const writtenBy = atomspace.addNode(AtomType.PREDICATE_NODE, "writtenBy");

const list3 = atomspace.addLink(AtomType.LIST_LINK, [document.id, author.id]);
atomspace.addLink(AtomType.EVALUATION_LINK, [writtenBy.id, list3.id]);

// Query: Get all information about the document
console.log("Document metadata:");
const docInfo = matcher.findPredicatesFor(document.id);
for (const info of docInfo) {
  console.log(
    `- ${info.predicate.name}:`,
    info.args.map((a) => a.name),
  );
}
```

## Integration Tips

### With Memory System

```typescript
// After processing a conversation turn, extract facts to AtomSpace
async function extractKnowledge(sessionId: string) {
  const memory = loadMemory(sessionId);

  // Extract entities and relationships
  for (const entry of memory.entries) {
    // Use NER or LLM to extract entities
    const entities = await extractEntities(entry.content);

    // Add to AtomSpace
    for (const entity of entities) {
      atomspace.addNode(AtomType.CONCEPT_NODE, entity.name);
    }
  }
}
```

### With Agent Tools

```typescript
// Provide cognitive queries as agent tools
const knowledgeQueryTool = {
  name: "query_knowledge",
  description: "Query the knowledge base for relationships and facts",
  parameters: {
    query: "string",
    type: "inheritance | predicate | pattern",
  },
  execute: async (params) => {
    // Use pattern matcher to find results
    // Return formatted results to agent
  },
};
```

## Performance Tips

1. **Batch Operations**: Add multiple atoms before querying
2. **Index Reuse**: Get node references once and reuse IDs
3. **Pattern Specificity**: Use specific patterns to reduce search space
4. **Attention Pruning**: Periodically remove low-attention atoms

```typescript
// Good: Batch creation
const nodes = ["Cat", "Dog", "Bird"].map((name) => atomspace.addNode(AtomType.CONCEPT_NODE, name));

// Good: Reuse IDs
const catId = cat.id;
const dogId = dog.id;

// Avoid: Repeated lookups
// const cat = atomspace.getNode(...); // Every time
```
