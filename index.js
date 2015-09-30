function StaticTemplateComponent() {
    if (!this._template) {
        throw new Error('StaticTemplateComponent, ' + this.name + ', missing _template on instance');
    }

    var container = document.createElement('div');

    container.innerHTML = this._template;

    processStcIfAttrs.call(this, container);

    if (this.dependencies) {
        compileDependencies.call(this, container);
    }

    this._element = container.children[0];
    this.template = this._element && this._element.outerHTML || '';
    container.innerHTML = '';
}

function compileDependencies(container) {
    var self = this;
    var stcChildren = Array.prototype.slice.call(container.querySelectorAll('stc'));
    var depByNameMap = getDependencyByNameMap.call(self);
    var depName, depClass, argsAttr, childArgs, defFun, depInstance;

    stcChildren.forEach(function(child) {
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

            if (depInstance._element) {
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
                child.parentNode.removeChild(child);
            }
        } else {
            console.warn('Missing StaticTemplateComponent dependency,', depName, 'for', self.name);
        }
    });
}

function processStcIfAttrs(container) {
    var stcIfChildren = Array.prototype.slice.call(container.querySelectorAll('[stc-if]'));
    var self = this;

    stcIfChildren.forEach(function(ifChild) {
        var ifAttr = ifChild.getAttribute('stc-if');

        if (!self[ifAttr] && ifChild.parentNode) {
            ifChild.parentNode.removeChild(ifChild);
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