var STC_REGEX = /<stc\s+name="([^"]+)"\s*>(.*?)<\/stc>/g;

function StaticTemplateComponent() {
    this.template = this._template || '';

    if (this.dependencies && this._template) {
        var depByNameMap = getDependencyByNameMap.call(this);
        var match;


        while ((match = STC_REGEX.exec(this.template))) {
            var depName = match[1];
            var depClass = depByNameMap[depName];

            if (depClass) {
                var depInstance = new depClass.apply(null, arguments);
                var startIndex = STC_REGEX.lastIndex - match[0].length;
                var preString = this.template.substring(0, startIndex);
                var postString = this.template.substring(STC_REGEX.lastIndex);

                this.template = preString + depInstance.template + postString;
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
            if (dep instanceof StaticTemplateComponent) {
                result[dep.name] = dep;
            } else {
                throw new Error('Invalid StaticTemplateComponent dependency. Must be instanceof StaticTemplateComponent');
            }
        });
    }

    return result;
}

module.exports = StaticTemplateComponent;