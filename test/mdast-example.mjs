import Asciidoctor from 'asciidoctor';
import {fromMarkdown} from 'mdast-util-from-markdown'
import MdastJSONConverter from "../src/mdast.mjs";
import { removePosition } from 'unist-util-remove-position';

const asciidoctor = Asciidoctor();
asciidoctor.ConverterFactory.register(new MdastJSONConverter({
    flat: true,
    noAsciiDocData: true,
}), ['mdast']);

function compare(name, t1, t2) {
    if(JSON.stringify(t1)===JSON.stringify(t2)) return true;
    console.warn("Test failed: ", name);
    console.warn("Expected: ", JSON.stringify(t1, null, 2));
    console.warn("Got: ", JSON.stringify(t2, null, 2));
    return false;
}

const convert=(doc) => {
    return asciidoctor.load(doc, {
        backend: 'mdast',
        doctype: 'article',
    }).convert();
}

function testDoc(name, document, markdownDocument) {
    console.log("Testing: ", name);
    let doc=convert(document);
    let mdast=fromMarkdown(markdownDocument || document);
    // Remove position information because it is not relevant for comparison and AsciiDoctor provides it
    // in different format than mdast.
    removePosition(mdast, { force: true });
    return compare(name, mdast, doc);
}

testDoc('simpleText', 'This is a simple paragraph.');
testDoc('simpleBoldText', '**Bold Text**');
testDoc('simpleItalicText', '_Italic text_', '*Italic text*');
testDoc('monospacedText', '`Monospaced text`');
testDoc('simpleLink', 'https://example.com[Link]', '[Link](https://example.com)');
testDoc('simpleImage', 'image::image.png[]', '![](image.png)');
testDoc('simpleImage2', 'image::image.png[Logo]', '![Logo](image.png)');