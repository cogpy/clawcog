/**
 * Tests for AtomSpace
 */

import { describe, it, expect, beforeEach } from "vitest";
import { AtomType, TruthValueHelpers, isNode, isLink } from "./atom-types.js";
import { AtomSpace } from "./atomspace.js";

describe("AtomSpace", () => {
  let atomspace: AtomSpace;

  beforeEach(() => {
    atomspace = new AtomSpace();
  });

  describe("Node operations", () => {
    it("should add a concept node", () => {
      const node = atomspace.addNode(AtomType.CONCEPT_NODE, "cat");

      expect(node.type).toBe(AtomType.CONCEPT_NODE);
      expect(node.name).toBe("cat");
      expect(node.id).toBeDefined();
      expect(node.truthValue).toBeDefined();
    });

    it("should retrieve a node by type and name", () => {
      atomspace.addNode(AtomType.CONCEPT_NODE, "dog");
      const retrieved = atomspace.getNode(AtomType.CONCEPT_NODE, "dog");

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("dog");
    });

    it("should not create duplicate nodes", () => {
      const node1 = atomspace.addNode(AtomType.CONCEPT_NODE, "animal");
      const node2 = atomspace.addNode(AtomType.CONCEPT_NODE, "animal");

      expect(node1.id).toBe(node2.id);
      expect(atomspace.size()).toBe(1);
    });

    it("should merge truth values on duplicate nodes", () => {
      const tv1 = TruthValueHelpers.create(0.8, 0.5);
      const tv2 = TruthValueHelpers.create(0.6, 0.7);

      atomspace.addNode(AtomType.CONCEPT_NODE, "test", tv1);
      const node = atomspace.addNode(AtomType.CONCEPT_NODE, "test", tv2);

      expect(node.truthValue?.confidence).toBeGreaterThan(0.5);
    });

    it("should store node values", () => {
      const node = atomspace.addNode(AtomType.NUMBER_NODE, "42", undefined, 42);

      expect(node.value).toBe(42);
    });
  });

  describe("Link operations", () => {
    it("should add a link between nodes", () => {
      const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "cat");
      const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "animal");

      const link = atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, animal.id]);

      expect(link.type).toBe(AtomType.INHERITANCE_LINK);
      expect(link.outgoing).toEqual([cat.id, animal.id]);
    });

    it("should throw error for invalid outgoing atoms", () => {
      expect(() => {
        atomspace.addLink(AtomType.INHERITANCE_LINK, ["invalid-id"]);
      }).toThrow();
    });

    it("should retrieve a link by type and outgoing", () => {
      const a = atomspace.addNode(AtomType.CONCEPT_NODE, "a");
      const b = atomspace.addNode(AtomType.CONCEPT_NODE, "b");

      atomspace.addLink(AtomType.SIMILARITY_LINK, [a.id, b.id]);
      const retrieved = atomspace.getLink(AtomType.SIMILARITY_LINK, [a.id, b.id]);

      expect(retrieved).toBeDefined();
      expect(retrieved?.outgoing).toEqual([a.id, b.id]);
    });

    it("should not create duplicate links", () => {
      const x = atomspace.addNode(AtomType.CONCEPT_NODE, "x");
      const y = atomspace.addNode(AtomType.CONCEPT_NODE, "y");

      const link1 = atomspace.addLink(AtomType.MEMBER_LINK, [x.id, y.id]);
      const link2 = atomspace.addLink(AtomType.MEMBER_LINK, [x.id, y.id]);

      expect(link1.id).toBe(link2.id);
      expect(atomspace.size()).toBe(3); // 2 nodes + 1 link
    });
  });

  describe("Incoming/Outgoing operations", () => {
    it("should track incoming links", () => {
      const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "cat");
      const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "animal");
      const mammal = atomspace.addNode(AtomType.CONCEPT_NODE, "mammal");

      atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, animal.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, mammal.id]);

      const incoming = atomspace.getIncoming(cat.id);

      expect(incoming).toHaveLength(2);
      expect(incoming.every(isLink)).toBe(true);
    });

    it("should retrieve outgoing atoms", () => {
      const pred = atomspace.addNode(AtomType.PREDICATE_NODE, "likes");
      const john = atomspace.addNode(AtomType.CONCEPT_NODE, "John");
      const mary = atomspace.addNode(AtomType.CONCEPT_NODE, "Mary");

      const listLink = atomspace.addLink(AtomType.LIST_LINK, [john.id, mary.id]);
      const evalLink = atomspace.addLink(AtomType.EVALUATION_LINK, [pred.id, listLink.id]);

      const outgoing = atomspace.getOutgoing(evalLink.id);

      expect(outgoing).toHaveLength(2);
      expect(outgoing[0].id).toBe(pred.id);
      expect(outgoing[1].id).toBe(listLink.id);
    });
  });

  describe("Query operations", () => {
    beforeEach(() => {
      atomspace.addNode(AtomType.CONCEPT_NODE, "cat");
      atomspace.addNode(AtomType.CONCEPT_NODE, "dog");
      atomspace.addNode(AtomType.PREDICATE_NODE, "likes");
    });

    it("should query by type", () => {
      const concepts = atomspace.query({ type: AtomType.CONCEPT_NODE });

      expect(concepts).toHaveLength(2);
      expect(concepts.every(isNode)).toBe(true);
    });

    it("should query by name", () => {
      const results = atomspace.query({ name: "cat" });

      expect(results).toHaveLength(1);
      expect(isNode(results[0]) && results[0].name).toBe("cat");
    });

    it("should return all atoms with empty query", () => {
      const all = atomspace.query({});

      expect(all.length).toBe(atomspace.size());
    });
  });

  describe("Delete operations", () => {
    it("should delete a node", () => {
      const node = atomspace.addNode(AtomType.CONCEPT_NODE, "temp");
      const sizeBefore = atomspace.size();

      const deleted = atomspace.deleteAtom(node.id);

      expect(deleted).toBe(true);
      expect(atomspace.size()).toBe(sizeBefore - 1);
      expect(atomspace.getAtom(node.id)).toBeUndefined();
    });

    it("should delete a link and update incoming index", () => {
      const a = atomspace.addNode(AtomType.CONCEPT_NODE, "a");
      const b = atomspace.addNode(AtomType.CONCEPT_NODE, "b");
      const link = atomspace.addLink(AtomType.SIMILARITY_LINK, [a.id, b.id]);

      atomspace.deleteAtom(link.id);

      expect(atomspace.getIncoming(a.id)).toHaveLength(0);
      expect(atomspace.getIncoming(b.id)).toHaveLength(0);
    });

    it("should return false for non-existent atom", () => {
      const deleted = atomspace.deleteAtom("non-existent");

      expect(deleted).toBe(false);
    });
  });

  describe("Clear operation", () => {
    it("should clear all atoms", () => {
      atomspace.addNode(AtomType.CONCEPT_NODE, "cat");
      atomspace.addNode(AtomType.CONCEPT_NODE, "dog");

      atomspace.clear();

      expect(atomspace.size()).toBe(0);
    });
  });

  describe("Truth value updates", () => {
    it("should update truth value of an atom", () => {
      const node = atomspace.addNode(AtomType.CONCEPT_NODE, "test");
      const newTv = TruthValueHelpers.create(0.9, 0.8);

      const updated = atomspace.updateTruthValue(node.id, newTv);

      expect(updated).toBe(true);
      const retrieved = atomspace.getAtom(node.id);
      expect(retrieved?.truthValue).toEqual(newTv);
    });
  });

  describe("Attention value updates", () => {
    it("should update attention value of an atom", () => {
      const node = atomspace.addNode(AtomType.CONCEPT_NODE, "test");
      const newAv = { sti: 100, lti: 50, vlti: true };

      const updated = atomspace.updateAttention(node.id, newAv);

      expect(updated).toBe(true);
      const retrieved = atomspace.getAtom(node.id);
      expect(retrieved?.attentionValue).toEqual(newAv);
    });
  });

  describe("Complex knowledge structures", () => {
    it("should represent inheritance hierarchy", () => {
      // Create: Cat -> Mammal -> Animal
      const cat = atomspace.addNode(AtomType.CONCEPT_NODE, "Cat");
      const mammal = atomspace.addNode(AtomType.CONCEPT_NODE, "Mammal");
      const animal = atomspace.addNode(AtomType.CONCEPT_NODE, "Animal");

      atomspace.addLink(AtomType.INHERITANCE_LINK, [cat.id, mammal.id]);
      atomspace.addLink(AtomType.INHERITANCE_LINK, [mammal.id, animal.id]);

      const catIncoming = atomspace.getIncoming(cat.id);
      const mammalIncoming = atomspace.getIncoming(mammal.id);

      expect(catIncoming).toHaveLength(1);
      expect(mammalIncoming).toHaveLength(2); // One from Cat, one to Animal
    });

    it("should represent evaluation (predicate with arguments)", () => {
      // (Evaluation (Predicate "likes") (List (Concept "John") (Concept "Mary")))
      const likesNode = atomspace.addNode(AtomType.PREDICATE_NODE, "likes");
      const johnNode = atomspace.addNode(AtomType.CONCEPT_NODE, "John");
      const maryNode = atomspace.addNode(AtomType.CONCEPT_NODE, "Mary");

      const listLink = atomspace.addLink(AtomType.LIST_LINK, [johnNode.id, maryNode.id]);
      const evalLink = atomspace.addLink(AtomType.EVALUATION_LINK, [likesNode.id, listLink.id]);

      expect(evalLink.outgoing).toHaveLength(2);
      const outgoing = atomspace.getOutgoing(evalLink.id);
      expect(outgoing[0].id).toBe(likesNode.id);
      expect(isLink(outgoing[1])).toBe(true);
    });
  });
});
