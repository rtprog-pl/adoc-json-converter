import { parse, stringify } from '@rtprog/json-string';

/**
 * @typedef {import('@types/mdast').Parent} MdastNode
 * @property {String} type Mdast node type
 * @property {Array<MdastNode>} [children] Mdast children nodes
 * @property {Object} [data] Mdast data object
 * @property {String} [value] Mdast value
 */

/**
 * @typedef {Object} ConverterExtra
 * @property {String} name AsciiDoctor node name
 * @property {String} context AsciiDoctor node context
 */

/**
 * @typedef {MdastNode & ConverterExtra} Node
 */

/**
 * @typedef {Object} JSONConverterOptions
 * @property {boolean} [flat] Flatten the output to be Mdast more compatible; default `false`
 * @property {boolean} [noAsciiDocData] Do not include AsciiDoc data in Mdast output; default `false`
 */


/**
 * @class
 * @extends import('asciidoctor').Converter
 **/
export default class MdastJSONConverter {
    /**
     * @param {JSONConverterOptions} [opts] Additional options
     */
    constructor(opts) {
        /**
         * @type {JSONConverterOptions}
         */
        this.opts=opts || {};
    }

    /**
     * Helper function that converts nodes to Mdast format
     * especially text (`String`) nodes.
     * @param {Array<string|Node>|string|Node} nodes
     * @param {boolean} [child] If `true` then it is a child node
     * @return {Array<Node>|Node}
     */
    fixNodes(nodes, child) {
        // Already valid node
        if(typeof(nodes)==='object' && typeof (nodes.type)==='string') {
            if(nodes.type==='block' && this.opts.flat) {
                return this.fixNodes(nodes.children, child);
            }
            if(child) return nodes;
            return [nodes];
        }
        // If single text node
        if(typeof(nodes)==='string') {
            const t= {
                type: 'text',
                value: nodes
            }
            if(child) return t;
            return [t];
        }
        if(child) return nodes;
        // If array of nodes
        if(Array.isArray(nodes)) {
            return nodes.map(n => this.fixNodes(n, true));
        }
        // Manly for debugging
        console.warn("Unknown node: ", nodes);
        return nodes;
    }

    /**
     * Helper function to convert AsciiDoctor AbstractNode position to Unist Position.
     * @param {import('asciidoctor').AbstractNode} node
     * @return {import('@types/unist').Position}
     */
    convertPosition(node) {
        if(typeof(node.source_location)!=='object') return undefined;
        /**
         * @type {import('asciidoctor').SourceLocation}
         */
        const sl=node.source_location;
        if(typeof(sl.getLineNumber)!=='function') return undefined;
        const point={
            line: sl.getLineNumber(),
            column: 0,
            file: sl.getFile(),
        }
        return {
            start: point,
            end: point,
        }
    }

    /**
     * Main convert function
     * @param {import('asciidoctor').AbstractNode} node
     * @param {string} [transform]
     * @package {{}} [opts]
     */
    convert(node, transform, opts) {
        switch (node.getNodeName()) {
            case "document":
                return this.processObjectNode(node, 'root');
            case "preamble":
                return this.processObjectNode(node, 'block');
            case "section":
                return this.processSection(node);
            case "paragraph":
                return this.processParagraph(node);
            case "ulist":
                return this.processList(node, 'list');
            case "inline_quoted":
                return this.processInline(node);
            case "inline_anchor":
                return this.processLink(node);
            case "inline_image":
            case "image":
                return this.processImage(node);
            default:
                console.warn(`Unprocessed node: ${node.getContext()}:${node.getNodeName()}`);
        }
        // Default node processing
        return stringify(this.processObjectNode(node, 'unknown:'+node.getNodeName()));
    }

    /**
     * Process default node
     * @param {import('asciidoctor').AbstractNode} node
     * @param {String} type Mdast type name
     * @param {Object} other Other Mdast parameters to include in result
     */
    processObjectNode(node, type) {
        /** @type {Node} */
        let r={
            type,
        }
        if(this.opts.noAsciiDocData!==true) {
            // Extra property from AsciiDoctor
            r.name=node.getNodeName();
            r.context=node.getContext();
        }
        // Copy AsciiDoctor attributes to Mdast data
        const attributes=node.getAttributes();
        if(attributes && Object.keys(attributes).length>0) node.data={...attributes};

        if(typeof(node.getBlocks)==='function') r.children=this.fixNodes(node.getBlocks().map(b => parse(this.convert(b))));
        else if(typeof(node.getContent)==='function') r.children=this.fixNodes(parse(node.getContent()));


        if(typeof(node.getTitle)==='function' && node.getTitle()) r.title=node.getTitle();
        if(typeof(node.getAlt)==='function' && node.getAlt()) r.alt=node.getAlt();
        if(typeof(node.getTarget)==='function' && node.getTarget()) r.target=node.getTarget();
        if(typeof(node.getType)==='function' && node.getType()) r.asciiDocType=node.getType();
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
     * @return {Node}
     */
    processParagraph(node) {
        const content=node.getContent();
        return {
            type: 'paragraph',
            children: this.fixNodes(parse(content))
        }

        const attributes=node.getAttributes();
        if(attributes && Object.keys(attributes).length>0) node.data={...attributes};
    }

    /**
     * Process list node
     * @param {import('asciidoctor').Inline} node
     */
    processInline(node) {
        let type;
        switch (node.getType()) {
            case 'strong':
            case "emphasis":
                type=node.getType();
                break;
            case "monospaced":
                return stringify({
                    type: 'inlineCode',
                    value: parse(node.getText()),
                });
            default:
                type='inline:'+node.getType();
        }
        const text=this.fixNodes(parse(node.getText()));
        const n={
            type,
            children: text,
        }
        if(this.opts.noAsciiDocData!==true) {
            n.name=node.getNodeName();
            n.context=node.getContext();
        }
        return stringify(n);
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

    /**
     * @param {import('asciidoctor').Inline} node
     * @returns {string}
     */
    processLink(node) {
        const n= {
            type: 'link',
            title: node.getAlt() || null,
            url: node.getTarget(),
            children: this.fixNodes(parse(node.getText())),
        }
        return stringify(n);
    }

    /**
     * @param {import('asciidoctor').Inline} node
     */
    processImage(node) {
        let alt, target;
        if(node.getNodeName()==='inline_image') {
            alt=node.getAlt();
            target=node.getTarget();
        } else {
            alt=node.getAlt();
            node.getAttribute('target', null);
        }

        return stringify({
            type: 'image',
            alt: alt || null,
            url: target || null,
        });
    }

    /**
     * @param {import('asciidoctor').Section} node
     * @return {String}
     */
    processSection(node) {
        return stringify({
            type: 'block',
            children: [
                {
                    type: "heading",
                    depth: node.getLevel()+1,
                    children: this.fixNodes(parse(node.getTitle())),
                }, ...this.fixNodes(node.getBlocks().map(b => this.convert(b)))
            ]
        })
    }
}
