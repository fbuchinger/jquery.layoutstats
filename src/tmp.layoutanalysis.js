var tree = {};
$('body').find('div').each(function() {
	var numParents = $(this).parents().length;
	if (!tree[numParents]) {
		tree[numParents] = 1;
	} else {
		tree[numParents]++;
	}
})
var maxDepth = Object.keys(tree).pop();
var maxWidth = 0;
Object.keys(tree).forEach(function(depthIndex) {
	if (tree[depthIndex] > maxWidth) {
		maxWidth = tree[depthIndex];
	}
})
console.log(maxDepth / maxWidth);
