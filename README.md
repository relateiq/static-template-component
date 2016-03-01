# static-template-component

A static template component (STC) is a lightweight utility class for rendering HTML in a component-oriented way.
Similar to Angular 1.x directives, components are defined in Javascript and used as HTML elements.
Creating an instance of StaticTemplateComponent will compile a provided string template and replace HTML component dependecies with their own compiled representation. The instance will hold a reference to the resultant element and also the compile template.

The reason why this was created was to address performance issues with Angular 1.x directive compilation and digest.
Using this simple and fast Javascript based rendering of templates before $compile allows Angular to not devote runtime execution to compiling, watching, transluding, interpolating or even setting up a bind-once for perf-insensive pages.

##Basic Usage

```
// StaticTemplateComponent is the base class your STC should inherit from

var StaticTemplateComponent = require('static-template-component');

function MyExampleSTC(data) {

    // determines how this component will be referenced in HTML
    this.name = 'MyExampleSTC';
    
    // defines the dependent components necessary to compile the HTML template
    this.dependencies = [
      MyNestedSTC
    ];
    
    // this is the object reference used to pass arguments to nested <stc /> through the template below
    this.args = {
        data: data
    };


    // Below is the string template for this component
    // Nested STCs are defined by a <stc> element and references my the `name` attribute
    // The args="data" attribute on the nested <stc /> defines the arguments that the MyNestedSTC dependency will be instantiated with
    // The args attribute value can be a comma separated string of references in the this.args object (e.g. args="thing1, thing2")
    // An error will be thrown if a nested <stc/> component appears in the template that is not declare in the this.dependencies array
    // The .assign() is optional. It is a SugarJS function (any string interpolation tool will do) that replaces the {text} in the
    // template with the 'hello world' value in this example
    
    this._template = '<div> {text} <stc name="MyNestedSTC" args="data"></stc> </div>'.assign({
        text: 'hello world'
    });

    // call the super instance
    StaticTemplateComponent.apply(this, arguments);
}

// Define MyNestedSTC used as a dependency above 
function MyNestedSTC(data) {
    this.name = 'MyNestedSTC';
    this._template = '<div>{text}</div>'.assign({
        text: data.foo + data.bar
    });

    StaticTemplateComponent.apply(this, arguments);
}

MyNestedSTC.prototype = Object.create(StaticTemplateComponent.prototype);
MyNestedSTC.prototype.constructor = MyNestedSTC;


// With the above code context, I can instantiate my MyExampleSTC
var myExampleSTC = new MyExampleSTC({ foo: 'test', bar: 123 });

myExampleSTC.element // the compile element based on the MyExampleSTC _template
myExampleSTC.template // the compile HTML string template based on the MyExampleSTC _template
// compiles to ==> '<div> hello world <div>test123</div> </div>'

```

##stc-if

Only retain an element in the compiled result if the evaluated stc-if attr value is truthy on the STC instance.

```
function IfSTC(data) {
    this.name = 'IfSTC';
    this.showSpan = data.foo; // any expression is permitted
    
    // the <span> will only exist in the compiled result if this.showSpan is truthy
    this._template = '<div> <span stc-if="showSpan"></span> </div>';

    StaticTemplateComponent.apply(this, arguments);
}

IfSTC.prototype = Object.create(StaticTemplateComponent.prototype);
IfSTC.prototype.constructor = IfSTC;
```

##stc-if-not

The opposite condition of stc-if.
Only retain an element in the compiled result if the evaluated stc-if attr value is falsey on the STC instance.

```
function IfNotSTC(data) {
    this.name = 'IfNotSTC';
    this.hideSpan = data.foo; // any expression is permitted
    
    // the <span> will only exist in the compiled result if this.hideSpan is falsey
    this._template = '<div> <span stc-if-not="hideSpan"></span> </div>';

    StaticTemplateComponent.apply(this, arguments);
}

IfNotSTC.prototype = Object.create(StaticTemplateComponent.prototype);
IfNotSTC.prototype.constructor = IfNotSTC;
```

##stc-contents

The appearance of the <stc-contents /> tag in a component's template defines the insertion point for any children of an <stc> dependency.

```
function ParentSTC() {
    this.name = 'ParentSTC';
    this._template = '<div> <stc name="ChildSTC">Any HTML insde here will be inserted where stc-contents is found</span> </stc> </div>';

    StaticTemplateComponent.apply(this, arguments);
}

ParentSTC.prototype = Object.create(StaticTemplateComponent.prototype);
ParentSTC.prototype.constructor = ParentSTC;

function ChildSTC() {
    this.name = 'ChildSTC';
    this._template = '<div> Before the contents <stc-contents/> After the contents </stc> </div>';

    StaticTemplateComponent.apply(this, arguments);
}

ChildSTC.prototype = Object.create(StaticTemplateComponent.prototype);
ChildSTC.prototype.constructor = ChildSTC;
```
