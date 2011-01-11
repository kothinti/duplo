(function() {
	var cacheRegExp = {}
	
	function classRegExp(name) {
		var key,
			flags = '',
			source;
		
		if (name instanceof RegExp) {
			source = name.source;
			key = name.toString();
			flags += name.ignoreCase ? 'i' : '';
		}
		else
			source = key = name.toString().escapeRegExp();
		
		if (!(key in cacheRegExp))
			return cacheRegExp[key] = new RegExp('(^|\\s+)' + source + '(\\s+|$)', flags)
		
		return cacheRegExp[key];
	};
	
	Object.implement(HTMLElement, {
		
		contains: function(node) {
			// The workaraund solution only for Firefox (See more: http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html)
			return !!(this.compareDocumentPosition(node) & 16);
		},
		
		insertAfter: function(newbie, reference) {
			if (reference = reference.nextSibling)
				this.insertBefore(newbie, reference);
			else
				this.appendChild(newbie);
		},
		
		insertSiblingBefore: function(node) {
			this.parentNode.insertBefore(node, this);
		},
		
		insertSiblingAfter: function(node) {
			this.parentNode.insertAfter(node, this);
		},
		
		insertSibling: function(node, before) {
			if (before || before === undefined)
				this.insertSiblingBefore(node);
			else
				this.insertSiblingAfter(node);
		},
		
		prependChild: function(node) {
			if (this.firstChild)
				this.insertBefore(node, this.firstChild);
			else
				this.appendChild(node);
		},
		
		removeNode: function() {
			if (this.parentNode)
				this.parentNode.removeChild(this);
		},
		
		replaceNode: function(node) {
			this.insertSibling(node);
			this.removeNode();
		},
		
		clearNode: function() {
			while (this.firstChild)
				this.removeChild(this.firstChild);
		},
		
		getParent: function(name) {
			var node = this;
			while (node) {
				if (node.hasClass && node.hasClass(name))
					return node;
				node = node.parentNode;
			}
			return null;
		},
		
		getChildren: function(name) {
			var children = [],
				node = this.firstChild;
			while (node) {
				if (node.hasClass && node.hasClass(name))
					children.push(node);
				node = node.nextSibling;
			}
			return children;
		},
		
		getDescendants: function(name, path) {
			var result = [];
			var node = this.firstChild;
			do {
				if (node && node.nodeType == 1) {
					if (name.test(node.className))
						result.push(node);
					
					if (!path || path.test(node.className))
						result = result.concat(node.getDescendants(name, path));
				}
			} while (node && (node = node.nextSibling));
			return result;
		},
		
		redraw: function() {
			var node = this;
			var c = 'random' + Math.round(Math.random() * 10000);
			node.addClass(c);
			setTimeout(function () {
				node.removeClass(c);
			}, 1);
		},
		
		offset: function(reference) {
			return {
				left: this.offsetLeft,
				top: this.offsetTop
			}
		},
		
		repaint: function() {
			
		},
		
		reflow: function() {
			
		},
		
		addClass: function(name) {
			var addons = addons = name.split(' ').filter(function(name) {
				return !this.hasClass(name);
			}, this);
			
			if (addons.length)
				this.className += ' ' + addons.join(' ');
		},
		
		removeClass: function(name) {
			var classes = this.className.normalize().split(' ');
			if (classes.exists(name)) {
				classes.remove(name);
				this.className = classes.join(' ');
			}
		},
		
		assignClass: function(name, assign) {
			if (assign)
				this.addClass(name);
			else
				this.removeClass(name);
		},
		
		toggleClass: function(name) {
			if (this.hasClass(name))
				this.removeClass(name);
			else
				this.addClass(name);
		},
		
		hasClass: function(name) {
			return classRegExp(name).test(this.className);
		}
	})
	
	function createElement(document, name, attributes) {
		var element = document.createElement(name);
		for (var i in attributes)
			element.setAttribute(i, attributes[i]);
		//setElementAttributes(element, attributes);
		var head = document.getElementsByTagName('head')[0]
		head.insertBefore(element, head.firstChild);
		return element;
	}
	
	document.importScript = function(url) {
		var script = createElement(document, 'script', {
			src: url,
			type: 'text/javascript'
		});
		
		return script;
	}
	
	
	document.create = function(x) {
		// {node, name, child, attribute, property, event, link (node, ), service, append}
		if (typeof x == "string")
			return document.createTextNode(x);
		
		if ((typeof Widget != "undefined") && (x instanceof Widget))
			x = x.main();
		
		if (x.nodeType)
			return x;
		
		var node = null;
		if (x.node) {
			node = x.node;
			node.clearNode();
		}
		else
			node = document.createElement(x.tag ? x.tag : 'div');
		
		if (x.name)
			node.className = x.name;
		
		// text
		var a = x.text || x.content;
		if (a) {
			a = document.createTextNode(a);
			node.appendChild(a);
		}
		
		a = x.html;
		if (a) {
			node.innerHTML = a;
		}
		
		a = x.child;
		if (a) {
			if (!(a instanceof Array))
				a = [a];
			for(var i = 0; i < a.length; i++)
				if (a[i])
					node.appendChild(document.create(a[i]));
		}
		
		a = x.attribute;
		if (a)
			for (var i in a)
				if (a[i] == null)
					node.removeAttribute(i);
				else
					node.setAttribute(i, a[i]);
		
		a = x.style;
		if (a)
			for (var i in a)
				node.style[i] = a[i] || '';
		
		a = x.property;
		if (a)
			for (var i in a)
				node[i] = a[i];
		
		// event
		a = x.event;
		if (a) {
			if (!(a instanceof Array))
				a = [a];
			for (var i = a.length; i --;)
				node.on(a[i].name || a[i].type, a[i].listener, {context: a[i].context})
		}
		
		// on
		a = x.on;
		if (a)
			for (var i in a)
				if (typeof a[i] == 'function')
					node.on(i, a[i]);
				else
					node.on(i, a[i].listener, a[i]);
		
		// reference
		if (a = x.reference) {
			if (!(a instanceof Array))
				a = [a];
			for (var i = a.length; i --;)
				for (var name in a[i])
					a[i][name][name] = node;
		}
		
		// link
		if (x.link)
			x.link.hash[x.link.name] = node;
		
		// service
		if (x.service) {
			if (x.service instanceof Function)
				x.service(node);
			else
				Widget.service(node);
		}
		
		// append
		if (x.append)
			x.append.appendChild(node);
		
		return node;
	}
})();