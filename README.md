# static-template-component

A static template component (STC) is a lightweight utility class for rendering HTML in a component-oriented way.
Similar to Angular 1.x directives, components are defined in Javascript and used as HTML elements.
Creating an instance of StaticTemplateComponent will compile a provided string template and replace HTML component dependecies with their own compiled representation. The instance will hold a reference to the resultant element and also the compile template.

##Usage

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
    
    // this object is the data bus used to pass data to the HTML template and to nested components
    this.args = {
        data: data
    };


    // string template for this component
    // Data reference evaluation is simply keying into the this.args object my name (e.g. data in the template is === this.args.data)
    // The args="data" attribute on the nested <stc /> defines the arguments that the MyNestedSTC dependency will be instantiated with
    // the .assign() is optional. It is a SugarJS function (can use anything really) that replaces the {text} in the template
    // with the 'hello world' value in this example
    // An error will be thrown if a nested <stc/> component appears in the template that is not declare in the this.dependencies array
    this._template = '<div> {text} <stc name="MyNestedSTC" args="data"></stc> </div>'.assign({
        text: 'hello world'
    });

    // call the super instance
    StaticTemplateComponent.apply(this, arguments);
}

// Define MyNestedSTC used as a dependency above 
function MyNestedSTC(data) {
    this.name = 'MyNestedSTC';
    this.dependencies = [];
    this.args = {};
    this._template = '<div>{text}</div>'.assign({
        text: data.foo + data.bar
    });

    StaticTemplateComponent.apply(this, arguments);
}

MyNestedSTC.prototype = Object.create(StaticTemplateComponent.prototype);
MyNestedSTC.prototype.constructor = MyNestedSTC;
```
