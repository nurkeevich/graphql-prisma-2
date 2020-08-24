import { objectType } from "@nexus/schema";

export const Comment = objectType({
    name: "Comment",
    definition(t) {
        t.model.id();
        t.model.text();
        t.model.postId
        t.model.post();
        t.model.authorId();
        t.model.author();
    }
});
