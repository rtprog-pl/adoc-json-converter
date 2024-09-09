import Asciidoctor from 'asciidoctor';
import JSONConverter from "../src/index.mjs";

const asciidoctor = Asciidoctor();
asciidoctor.ConverterFactory.register(new JSONConverter(), ['json']);

const convert=(doc) => {
    return asciidoctor.load(doc, {
        backend: 'json',
        doctype: 'article',
    }).convert();
}

console.log("Simple List")
let doc=convert(`
* Item 1
* Item 2
`);
console.log(JSON.stringify(doc, null, 2));

console.log("Simple List with formatted text")
doc=convert(`
* Item with **bold** text
* Item with _italic_ text
* Item with combined **bold and _italic_** text
`);
console.log(JSON.stringify(doc, null, 2));