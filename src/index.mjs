import { parse, stringify } from '@rtprog/json-string';

/**
 * @class
 * @extends import('asciidoctor').Converter
 **/
export default class JSONConverter {
    /**
     * Main convert function
     * @param {import('asciidoctor').AbstractNode} node
     * @param {string} [transform]
     * @package {{}} [opts]
     */
    convert(node, transform, opts) {
        switch (node.getNodeName()) {
            case "document":
            case "preamble":
            case "section":
                return this.processObjectNode(node);
            case "paragraph":
                return this.processParagraph(node);
            case "ulist":
                return this.processList(node);
            case "inline_quoted":
                return this.processInline(node);
            // default:
                // console.warn(`Unprocessed node: ${node.getContext()}:${node.getNodeName()}`);
        }
        // Default node processing
        return stringify(this.processObjectNode(node));
    }

    /**
     * Process default node
     * @param {import('asciidoctor').AbstractNode} node
     */
    processObjectNode(node) {
        let r={
            name: node.getNodeName(),
            context: node.getContext(),
            attributes: { ...node.getAttributes() },
        }
        if(typeof(node.getTitle)==='function' && node.getTitle()) r.title=node.getTitle();
        if(typeof(node.getBlocks)==='function') r.blocks=node.getBlocks().map(b => parse(this.convert(b)));
        else if(typeof(node.getContent)==='function') r.content=parse(node.getContent());
        if(typeof(node.getAlt)==='function' && node.getAlt()) r.alt=node.getAlt();
        if(typeof(node.getTarget)==='function' && node.getTarget()) r.target=node.getTarget();
        if(typeof(node.getType)==='function' && node.getType()) r.type=node.getType();
        // if(typeof(node.getAuthor)==='function' && node.getAuthor()) r.author=node.getAuthor();
        if(typeof(node.getId)==='function' && node.getId()) r.id=node.getId();
        // if(typeof(node.getCaption)==='function' && node.getCaption()) r.caption=node.getCaption();
        if(typeof(node.getRole)==='function' && node.getRole()) r.role=node.getRole();
        if(typeof(node.getReftext)==='function' && node.getReftext()) r.reftext=node.getReftext();
        if(typeof(node.getLevel)==='function' && node.getLevel()) r.reftext=node.getLevel();


        return r;
    }

    /**
     * Process paragraph node
     * @param {import('asciidoctor').AbstractBlock} node
     */
    processParagraph(node) {
        const content=node.getContent();
        return {
            name: node.getNodeName(),
            context: node.getContext(),
            attributes: {...node.getAttributes()},
            text: parse(content)
        }
    }

    /**
     * Process list node
     * @param {import('asciidoctor').Inline} node
     */
    processInline(node) {
        const text=node.getText();
        return stringify({
            name: node.getNodeName(),
            context: node.getContext(),
            type: node.getType(),
            target: node.getTarget(),
            // alt: node.getAlt(),
            text: parse(text),
        });
    }

    /**
     * Process list node
     * @param {import('asciidoctor').List} node
     * @return {undefined}
     */
    processList(node) {
        return {
            name: node.getNodeName(),
            context: node.getContext(),
            items: node.getItems().map(i => {
                const text=i.getText();
                return {
                    text: parse(text),
                    blocks: i.getBlocks().map(b => parse(this.convert(b))),
                }
            })
        }
    }
}
