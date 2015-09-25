var STC_REGEX = /<stc\s+name="([^"]+)"\s*>(.*?)<\/stc>/g;
var STC_CONTENTS_REGEX = /<stc-contents\s*\/>/;

function StaticTemplateComponent() {
    this.template = this._template || '';

    if (this.dependencies && this._template) {
        var depByNameMap = getDependencyByNameMap.call(this);
        var match;

        STC_REGEX.lastIndex = 0;

        while ((match = STC_REGEX.exec(this.template))) {
            var depName = match[1];
            var depClass = depByNameMap[depName];

            if (depClass) {
                var storedLastIndex = STC_REGEX.lastIndex;
                var args = Array.prototype.slice.call(arguments);
                args.unshift(depClass);

                var defFun = depClass.bind.apply(depClass, args);
                var depInstance = new defFun();
                STC_REGEX.lastIndex = storedLastIndex;

                var startIndex = STC_REGEX.lastIndex - match[0].length;
                var preString = this.template.substring(0, startIndex);
                var postString = this.template.substring(STC_REGEX.lastIndex);

                if (!(depInstance instanceof StaticTemplateComponent)) {
                    throw new Error('Invalid StaticTemplateComponent dependency. Must be instanceof StaticTemplateComponent');
                }

                this.template = preString + depInstance.template + postString;
                depInstance.template = depInstance.template.replace(STC_CONTENTS_REGEX, match[2] || '');
                STC_REGEX.lastIndex += depInstance.template.length - match[0].length;
            } else {
                console.warn('Missing StaticTemplateComponent dependency,', depName, 'for', this.name);
            }
        }
    }
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