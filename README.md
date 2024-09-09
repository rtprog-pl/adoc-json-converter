# adoc-json-converter
AsciiDoctor.js JSON Converter

## Installation
```shell
npm install @rtprog/adoc-json-converter
```

## Usage
```javascript
const Asciidoctor = require('asciidoctor.js');
const JSONConverter = require('@rtprog/adoc-json-converter');

const asciidoctor=Asciidoctor();
asciidoctor.ConverterFactory.register(new JSONConverter(), ['json']);

asciidoctor.load(doc, {
    backend: 'json',
    doctype: 'article',
}).convert();
```
