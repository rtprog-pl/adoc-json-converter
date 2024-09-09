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
            default:
                console.warn(`Unprocessed node: ${node.getContext()}:${node.getNodeName()}`);
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
        }
        if(typeof(node.getTitle)==='function') r.title=node.getTitle();
        if(typeof(node.getBlocks)==='function') r.blocks=node.getBlocks().map(b => parse(this.convert(b)));
        else if(typeof(node.getContent)==='function') r.content=parse(node.getContent());

        return r;
    }

    /**
     * Process paragraph node
     * @param {import('asciidoctor').AbstractBlock} node
     */
    processParagraph(node) {
        return {
            name: node.getNodeName(),
            context: node.getContext(),
            text: parse(node.getContent())
        }
    }

    /**
     * Process list node
     * @param {import('asciidoctor').Inline} node
     */
    processInline(node) {
        return stringify({
            name: node.getNodeName(),
            context: node.getContext(),
            text: parse(node.getText()),
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
                return {
                    text: parse(i.getText()),
                    blocks: i.getBlocks().map(b => parse(this.convert(b))),
                }
            })
        }
    }
}
