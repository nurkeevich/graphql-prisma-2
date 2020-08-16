import { objectType } from "@nexus/schema";

class Types {
    static User = objectType({
        name: "User",
        definition(t) {
            t.model.id();
            t.model.name();
            t.model.email();
            t.model.posts({
                pagination: false
            });
        }
    });

    static Post = objectType({
        name: "Post",
        definition(t) {
            t.model.id();
            t.model.title();
            t.model.content();
            t.model.published();
            t.model.authorId();
        }
    });
}

export default Types;
