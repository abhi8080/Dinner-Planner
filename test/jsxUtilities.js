function findTag(tag, tree){
    let tags= tree.children?tree.children.flat().map(
        function child2TagsCB(t){
            return findTag(tag, t);}
    ).flat():[];
    if(tree.tag==tag)
        tags=[tree, ...tags];
    return tags;
}

export {findTag};

