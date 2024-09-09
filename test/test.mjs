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

console.log("Simple")
let doc=convert(`Simple text`);
console.log(doc);

console.log("Image")
doc=convert(`image::test.png[]`);
console.log(doc);


console.log("Formatted")
doc=convert(`Hello, _Asciidoctor **bold**_`);
console.log(JSON.stringify(doc, null, 2));

console.log("Formatted2")
doc=convert(`This is a **bold text, with _italic fragment_**`)
console.log(JSON.stringify(doc, null, 2));


console.log("Test1")
doc=convert(`= Document title`);
console.log(doc);

console.log("Test2")
doc=convert(`Hello, _Asciidoctor_`);
console.log(JSON.stringify(doc, null, 2));

doc=asciidoctor.loadFile('./test/doc1.adoc', {
    backend: 'json',
    doctype: 'article',
});
console.log("doc1.adoc");
console.log(JSON.stringify(doc.convert(), null, 2));