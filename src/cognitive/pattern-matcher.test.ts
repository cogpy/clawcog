/**
 * Tests for Pattern Matcher
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AtomType } from "./atom-types.js";
import { AtomSpace } from "./atomspace.js";
import { PatternMatcher, type PatternLink } from "./pattern-matcher.js";

describe("PatternMatcher", () => {
  let atomspace: AtomSpace;
  let matcher: PatternMatcher;

  beforeEach(() => {
    atomspace = new AtomSpace();
    matcher = new PatternMatcher(atomspace);
  });

  describe("Inheritance queries", () => {
    beforeEach(() => {
      // Create: Cat -> Mammal -> Animal
      const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "Cat");
      const mammal = atomspace.addNode(AtomType.CONCEPT_NODE, "Mammal");
      const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "Animal");

      atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, mammal.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [mammal.id, animal.id]);
    });

    it("should find direct inheritance targets", () => {
      const cat = atomspace.getNode(AtomType.CONCEPT_NODE, "Cat")!;
      const targets = matcher.findInheritanceTargets(cat.id);

      expect(targets).toHaveLength(1);
      expect(targets[0].name).toBe("Mammal");
    });

    it("should find all superclasses (transitive)", () => {
      const cat = atomspace.getNode(AtomType.CONCEPT_NODE, "Cat")!;
      const superclasses = matcher.findAllSuperclasses(cat.id);

      expect(superclasses).toHaveLength(2);
      const names = superclasses.map((n) => n.name);
      expect(names).toContain("Mammal");
      expect(names).toContain("Animal");
    });

    it("should find direct inheritance sources", () => {
      const mammal = atomspace.getNode(AtomType.CONCEPT_NODE, "Mammal")!;
      const sources = matcher.findInheritanceSources(mammal.id);

      expect(sources).toHaveLength(1);
      expect(sources[0].name).toBe("Cat");
    });

    it("should find all subclasses (transitive)", () => {
      const animal = atomspace.getNode(AtomType.CONCEPT_NODE, "Animal")!;
      const subclasses = matcher.findAllSubclasses(animal.id);

      expect(subclasses).toHaveLength(2);
      const names = subclasses.map((n) => n.name);
      expect(names).toContain("Mammal");
      expect(names).toContain("Cat");
    });
  });

  describe("Predicate evaluation", () => {
    beforeEach(() => {
      // Create: (Evaluation (Predicate "likes") (List John Mary))
      const likesNode = atomspace.addNode(AtomType.PREDICATE_NODE, "likes");
      const johnNode = atomspace.addNode(AtomType.CONCEPT_NODE, "John");
      const maryNode = atomspace.addNode(AtomType.CONCEPT_NODE, "Mary");

      const listLink = atomspace.addLink(AtomType.LIST_LINK, [johnNode.id, maryNode.id]);
      atomspace.addLink(AtomType.EVALUATION_LINK, [likesNode.id, listLink.id]);
    });

    it("should evaluate existing predicate", () => {
      const john = atomspace.getNode(AtomType.CONCEPT_NODE, "John")!;
      const mary = atomspace.getNode(AtomType.CONCEPT_NODE, "Mary")!;

      const result = matcher.evaluatePredicate("likes", [john.id, mary.id]);

      expect(result.found).toBe(true);
      expect(result.truthValue).toBeDefined();
    });

    it("should return false for non-existent predicate", () => {
      const john = atomspace.getNode(AtomType.CONCEPT_NODE, "John")!;
      const mary = atomspace.getNode(AtomType.CONCEPT_NODE, "Mary")!;

      const result = matcher.evaluatePredicate("hates", [john.id, mary.id]);

      expect(result.found).toBe(false);
    });

    it("should find all predicates for an entity", () => {
      const john = atomspace.getNode(AtomType.CONCEPT_NODE, "John")!;
      const predicates = matcher.findPredicatesFor(john.id);

      expect(predicates).toHaveLength(1);
      expect(predicates[0].predicate.name).toBe("likes");
      expect(predicates[0].args).toHaveLength(2);
    });
  });

  describe("Pattern matching", () => {
    beforeEach(() => {
      // Create knowledge: Cat, Dog inherit from Animal
      const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "Cat");
      const dog = atomspace.addNode(AtomType.CONCEPT_NODE, "Dog");
      const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "Animal");

      atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, animal.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [dog.id, animal.id]);
    });

    it("should match concrete pattern", () => {
      const pattern: PatternLink = {
        type: AtomType.INHERITANCE_LINK,
        outgoing: [
          {
            type: AtomType.CONCEPT_NODE,
            name: "Cat",
            isVariable: false,
          },
          {
            type: AtomType.CONCEPT_NODE,
            name: "Animal",
            isVariable: false,
          },
        ],
      };

      const results = matcher.match(pattern);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.matched)).toBe(true);
    });

    it("should match pattern with variables", () => {
      const pattern: PatternLink = {
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

      expect(results).toHaveLength(2); // Cat and Dog
      expect(results.every((r) => r.matched)).toBe(true);
      expect(results.every((r) => r.bindings.has("$X"))).toBe(true);
    });
  });

  describe("Complex knowledge structures", () => {
    it("should handle multi-level inheritance", () => {
      // Create: Siamese -> Cat -> Mammal -> Animal
      const siamese = atomspace.addNode(AtomType.CONCEPT_NODE, "Siamese");
      const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "Cat");
      const mammal = atomspace.addNode(AtomType.CONCEPT_NODE, "Mammal");
      const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "Animal");

      atomspace.addLink(AtomType.INHERITANCE_LINK, [siamese.id, cat.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, mammal.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [mammal.id, animal.id]);

      const superclasses = matcher.findAllSuperclasses(siamese.id);

      expect(superclasses).toHaveLength(3);
      const names = superclasses.map((n) => n.name);
      expect(names).toContain("Cat");
      expect(names).toContain("Mammal");
      expect(names).toContain("Animal");
    });

    it("should handle multiple inheritance", () => {
      // Create: Duck -> Bird and Duck -> Swimmer
      const duck = atomspace.addNode(AtomType.CONCEPT_NODE, "Duck");
      const bird = atomspace.addNode(AtomType.CONCEPT_NODE, "Bird");
      const swimmer = atomspace.addNode(AtomType.CONCEPT_NODE, "Swimmer");

      atomspace.addLink(AtomType.INHERITANCE_LINK, [duck.id, bird.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [duck.id, swimmer.id]);

      const superclasses = matcher.findAllSuperclasses(duck.id);

      expect(superclasses).toHaveLength(2);
      const names = superclasses.map((n) => n.name);
      expect(names).toContain("Bird");
      expect(names).toContain("Swimmer");
    });

    it("should handle circular references gracefully", () => {
      // Create: A -> B -> C -> A (cycle)
      const a = atomspace.addNode(AtomType.CONCEPT_NODE, "A");
      const b = atomspace.addNode(AtomType.CONCEPT_NODE, "B");
      const c = atomspace.addNode(AtomType.CONCEPT_NODE, "C");

      atomspace.addLink(AtomType.INHERITANCE_LINK, [a.id, b.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [b.id, c.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [c.id, a.id]);

      const superclasses = matcher.findAllSuperclasses(a.id);

      // Should visit each node only once
      expect(superclasses).toHaveLength(3);
    });
  });

  describe("Complex predicates", () => {
    it("should handle multiple predicates on same entity", () => {
      const john = atomspace.addNode(AtomType.CONCEPT_NODE, "John");
      const mary = atomspace.addNode(AtomType.CONCEPT_NODE, "Mary");
      const pizza = atomspace.addNode(AtomType.CONCEPT_NODE, "Pizza");

      const likes = atomspace.addNode(AtomType.PREDICATE_NODE, "likes");
      const knows = atomspace.addNode(AtomType.PREDICATE_NODE, "knows");

      const list1 = atomspace.addLink(AtomType.LIST_LINK, [john.id, mary.id]);
      const list2 = atomspace.addLink(AtomType.LIST_LINK, [john.id, pizza.id]);

      atomspace.addLink(AtomType.EVALUATION_LINK, [likes.id, list2.id]);
      atomspace.addLink(AtomType.EVALUATION_LINK, [knows.id, list1.id]);

      const predicates = matcher.findPredicatesFor(john.id);

      expect(predicates).toHaveLength(2);
      const predNames = predicates.map((p) => p.predicate.name);
      expect(predNames).toContain("likes");
      expect(predNames).toContain("knows");
    });
  });
});
