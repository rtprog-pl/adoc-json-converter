import Asciidoctor from 'asciidoctor';
import JSONConverter from "../src/index.cjs";

const asciidoctor = Asciidoctor();
asciidoctor.ConverterFactory.register(new JSONConverter(), ['json']);

const convert=(doc) => {
    return asciidoctor.load(doc, {
        backend: 'json',
        doctype: 'article',
    }).convert();
}

let doc=convert(`Simple text`);
console.log(doc);


doc=convert(`= Document title`);
console.log(doc);

doc=convert(`Hello, _Asciidoctor_`);
console.log(JSON.stringify(doc, null, 2));
