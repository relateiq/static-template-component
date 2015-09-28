function StaticTemplateComponent() {
    var container = document.createElement('div');

    if (this.dependencies && this._template) {
        container.innerHTML = this._template;
        compileDependencies.call(this, container);
    } else if (this._template) {
        container.innerHTML = this._template;
    } else {
        throw new Error('StaticTemplateComponent, ' + this.name + ', missing _template on instance');
    }

    this._element = container.children[0];
    this.template = this._element.outerHTML;
    container.innerHTML = '';
}

function compileDependencies(container) {
    var self = this;
    var children = Array.prototype.slice.call(container.querySelectorAll('stc'));
    var depByNameMap = getDependencyByNameMap.call(self);
    var depName, depClass, argsAttr, childArgs, defFun, depInstance;

    children.forEach(function(child) {
        depName = child.getAttribute('name');
        depClass = depByNameMap[depName];

        if (depClass) {
            childArgs = [depClass];

            if (self.args) {
                argsAttr = child.getAttribute('args') || '';
                argsAttr = argsAttr.split(/\s*,\s*/);
                argsAttr.forEach(function(argKey) {
                    childArgs.push(self.args[argKey]);
                });
            }

            defFun = depClass.bind.apply(depClass, childArgs);
            depInstance = new defFun();

            if (!(depInstance instanceof StaticTemplateComponent)) {
                throw new Error('Invalid StaticTemplateComponent dependency. Must be instanceof StaticTemplateComponent');
            }

            mergeAttributes(child, depInstance._element);
            child.parentNode.replaceChild(depInstance._element, child);

            var stcContents = depInstance._element.querySelector('stc-contents');

            if (stcContents) {
                while (child.childNodes.length > 0) {
                    stcContents.parentNode.insertBefore(child.childNodes[0], stcContents);
                }

                stcContents.parentNode.removeChild(stcContents);
            }
        } else {
            console.warn('Missing StaticTemplateComponent dependency,', depName, 'for', self.name);
        }
    });
}

function mergeAttributes(src, dest) {
    var srcAttrs = Array.prototype.slice.call(src.attributes);

    srcAttrs.forEach(function(attr) {
        var name = attr.nodeName;
        var value = attr.nodeValue;

        if (name === 'name' || name === 'args') {
            return;
        } else {
            if (name === 'class') {
                value = [dest.getAttribute('class'), value].join(' ');
            }

            dest.setAttribute(name, value);
        }
    });
}

function getDependencyByNameMap() {
    var result = {};

    if (this.dependencies) {
        this.dependencies.forEach(function(dep) {
            result[dep.name] = dep;
        });
    }

    return result;
}

module.exports = StaticTemplateComponent;