if(!ui) ui = lib.ui = {};

var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

ui.ClassTransition = ReactCSSTransitionGroup;

ui.map = function(array, fn) {
	return $.map(array, fn); // TODO what's the 'best' map function?
};

ui.choose = function(val, options) {
	return options[val];
};

ui.when = function(condition, fn, otherwise) {
	if(condition) {
		return fn();
	}
	if(otherwise) {
		return otherwise();
	}
	return null;
};

ui.isDescendant = function(parent, child) {
    var node = child.parentNode;
    while(node !== null) {
        if(node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

ui.eachProp = function(obj, handler) {
	for(var prop in obj) {
		handler(prop);
	}
};

ui.isArray = function(o) {
	return o && o.constructor === Array;
};

ui.isString = function(o) {
	return o && (o instanceof String || typeof(o) === 'string');
};

ui.truncate = function(s, sz) {
	return s.length > sz ? (s.substring(0,sz-3) + '...') : s;
};

/**
 * JSON.stringify, short-circuit on circular references
 */
ui.stringify = function(o) {
	var output = [];
	return json.stringify(o, function(key, value) {
		if(value instanceof Object) {
			if(output.indexOf(value) >= 0) {
				return ' ** ';
			}
			output.push(value);
		}
		return value;
	});
};

/**
 * Get children of a specific type
 */
ui.getChildrenOfType = function(children, type) {
	var renderedChildren = null;
	React.Children.forEach(children, function(child,i) {
		if(!child) {
			return;
		}
		if(child.type && child.type == type) {
			if(!renderedChildren) {
				renderedChildren = child;
			}
			else {
				if(!(renderedChildren instanceof Array)) {
					renderedChildren = [renderedChildren];
				}
				renderedChildren.push(child);
			}
		}
	});
	return renderedChildren;
};


/**
 * Get children of a specific type
 */
ui.eachChildOfType = function(children, type, fn) {
	var renderedChildren = null;
	React.Children.forEach(children, function(child,i) {
		if(!child) {
			return;
		}
		if(child.type && child.type == type) {
			if(!renderedChildren) {
				renderedChildren = fn(child);
			}
			else {
				if(!(renderedChildren instanceof Array)) {
					renderedChildren = [renderedChildren];
				}
				renderedChildren.push(fn(child));
			}
		}
	});
	return renderedChildren;
};

/**
 * Determines if the variable is 'empty'
 */
ui.isEmpty = function(val) {
	if(debug) console.log('is empty ' + val);
	return val === undefined || val === null || val === '';
};

/**
 * Get children of a specific type
 */
ui.getChildrenExclduingType = function(children, type) {
	var renderedChildren = null;
	React.Children.forEach(children, function(child,i) {
		if(!child) {
			return;
		}
		if(child.type && child.type != type) {
			if(!renderedChildren) {
				renderedChildren = child;
			}
			else {
				if(!(renderedChildren instanceof Array)) {
					renderedChildren = [renderedChildren];
				}
				renderedChildren.push(child);
			}
		}
	});
	return renderedChildren;
};

/**
 * Give the container a recommended width
 */
ui.Split = React.createClass({
	collectChildren: function(children, key) {
		var out = [];
		for(var i = 0; i < children.length; i++) {
			var child = children[i];
			if(ui.isArray(child)) {
				var grandChildren = this.collectChildren(child, key + i + '_');
				for(var j = 0; j < grandChildren.length; j++) {
					out.push(grandChildren[j]); // already wrapped in spans
				}
			}
			else {
				out.push(<span key={key + i}>{child}</span>);
			}
		}
		return out;
	},
	render: function() {
		return <div className={'j-ui-split' + (this.props.align ? (' align-' + this.props.align) : '')} style={this.props.style}>
		{this.collectChildren(this.props.children, '')}
		</div>;
	}
});

/**
 * Used to wrap elements in an inline-block with position: relative
 */
ui.Wrap = React.createClass({
	render: function() {
		return <span className="j-ui-wrap">{this.props.children}</span>;
	}
});

/**
 * Used for a horizontal 'row' wrapper to apply consistent padding
 */
ui.Row = React.createClass({
	render: function() {
		return <div className="j-ui-row">{this.props.children}</div>;
	}
});

ui.Button = React.createClass({
	getDefaultProps: function() {
		return {
			type: 'default',
			disabled: false
		};
	},
	handleClick: function(event) {
		event.preventDefault();
		if(this.props.onClick) {
			this.props.onClick();
		}
	},
	getContent: function() {
		if(React.Children.count(this.props.children) > 0) {
			return this.props.children;
		}
		return this.props.label;
	},
	render: function() {
		return <button className={'btn btn-' + this.props.type} disabled={this.props.disabled} onClick={this.handleClick}>{this.getContent()}</button>;
	}
});

ui.Icon = React.createClass({
	render: function() {
		return <span className={'glyphicon glyphicon-' + this.props.type} aria-hidden="true" style={this.props.style}></span>;
	}
});

ui.Tooltip = React.createClass({
    componentDidMount: function() {
    	$(ReactDOM.findDOMNode(this)).tooltip();
    },
	render: function() { return (
		<span className='tooltip' title={this.props.text}></span>
	);}
});

ui.Modal = React.createClass({
	getDefaultProps: function() {
		return {
			show: false
		};
	},
	getInitialState: function() {
		return {
			show: this.props.show
		};
	},
	componentWillReceiveProps: function(newProps) {
		if(newProps.show != this.state.show) {
			this.setState({show: newProps.show});
		}
	},
    componentDidUpdate: function(prevProps, prevState) {
    	if(!prevState.show && this.state.show) {
	        $(this.refs.modal).modal('show');
	        $(this.refs.modal).on('hidden.bs.modal', this.onClose);
    	}
    },
    componentDidMount: function() {
        $(this.refs.modal).modal('show');
        $(this.refs.modal).on('hidden.bs.modal', this.onClose);
    },
    onClose: function() {
    	if(this.props.onClose) {
    		this.props.onClose(this);
    	}
    },
    show: function() {
    	this.setState({show: true});
    },
    hide: function() {
    	this.setState({show: false});
    },
    render: function() {
    	if(!this.state.show) {
    		return null;
    	}
        return (
          <div className="modal fade" ref="modal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">{this.props.title}</h4>
                </div>
                <div className="modal-body">
                	{this.props.children}
                </div>
                <div className="modal-footer">
                  <ui.Button type="default" onClick={this.hide}>Close</ui.Button>
                  <ui.Button type="primary">Save changes</ui.Button>
                </div>
              </div>
            </div>
          </div>
        );
    },
    propTypes: {
        show: React.PropTypes.bool.isRequired,
        onClose: React.PropTypes.func.isRequired
    }
});

ui.Popover = React.createClass({
	getDefaultProps: function() {
		return {
			show: false,
			closeable: true,
			type: ''
		};
	},
	getInitialState: function() {
		return {
			show: this.props.show,
			position: this.props.position ? this.props.position : 'bottom-right',
			active: false
		};
	},
	propTypes: {
		show: React.PropTypes.bool,
		closeable: React.PropTypes.bool,
		fixed: React.PropTypes.bool,
		type: React.PropTypes.string,
		position: React.PropTypes.oneOf([
            'bottom-left','bottom-center','bottom-right',
            'top-left','top-center','top-right',
            'right-top','right-middle','right-bottom',
            'left-top','left-middle','left-bottom'])
	},
	componentWillReceiveProps: function(props) {
	    if(props.show != this.state.show) {
	    	this.setState({show: props.show});
	    	this.positionHandler();
	    }
	},
	componentWillUpdate: function(nextProps, nextState) {
    	if(!this.state.show && nextState.show) { // if the drop-down is shown
    		this.positionHandler();
    	}
	},
	componentDidUpdate: function(prevProps, prevState) {
    	if(!prevState.show && this.state.show) { // if the drop-down was shown
    		this.positionHandler();
    	}
	},
	positionHandler: function(e) {
		if(!this.state.show || this.props.fixed) {
			if(this.state.show && !this.state.active) {
				this.setState({active: true});
			}
			return;
		}

		var $this = $(ReactDOM.findDOMNode(this));
		$this = $this.find('.j-ui-popover'); // make sure this is right
		var w = $this.width();
		var h = $this.height();
		var l = $this.offset().left;
		var t = $this.offset().top;
		
		var $container = $this.offsetParent();
		var cw = $container.width();
		var ch = $container.height();
		var cl = $container.offset().left;
		var ct = $container.offset().top;
		var cr = cl + cw;
		var cb = ct + ch;
		
		// offsets from container - needs to match the css, maybe calc this?
		var insetT = 4; // inset to the container
		var insetR = 4;
		var insetB = 4;
		var insetL = 4;
		var offsetT = 10; // offset from the container
		var offsetR = 10;
		var offsetB = 10;
		var offsetL = 10;
		
		// Gather all the positions between:
		
		var vl = cr + offsetR - w;
		var vr = cl - offsetL + w;
		var vt = ct + insetT - h;
		var vb = cb - insetB + h;
		
		var hl = cl + insetL - w;
		var hr = cr - insetR + w;
		var ht = cb + offsetB - h;
		var hb = ct - offsetT + h;
		
		var $win = $(window);
		var $doc = $(document);
		var winW = $win.width();
		var winH = $win.height();
		var winL = $doc.scrollLeft();
		var winT = $doc.scrollTop();
		var winR = winL + winW;
		var winB = winT + winH;
		
		var canFit = {
			'bottom-left': vl > winL && vb < winB,
			'bottom-center': 0,
			'bottom-right': vr < winR && vb < winB,
			'top-left': vl > winL && vt > winT,
			'top-center': 0,
			'top-right': vr < winR && vt > winT,
			'right-top': hr < winR && ht > winT,
			'right-middle': 0,
			'right-bottom': hr < winR && hb < winB,
			'left-top': hl > winL && ht > winT,
			'left-middle': 0,
			'left-bottom': hl > winL && hb < winB
		};
		
		var isOver = {
			top: t < winT,
			bottom: t+h > winB,
			left: l < winL,
			right: l+w > winR
		};
		
		// not on screen
		// can fit another position?
		var preferred = this.props.position && canFit[this.props.position] ? this.props.position : this.state.position;
		if(!canFit[preferred]) {
			if(isOver.top) {
				preferred = preferred.replace('top','bottom');
			}
			if(isOver.right) {
				preferred = preferred.replace('right','left');
			}
			if(isOver.bottom) {
				preferred = preferred.replace('bottom','top');
			}
			if(isOver.left) {
				preferred = preferred.replace('left','right');
			}
		}
		
		if(preferred != this.state.position && canFit[preferred]) {
			this.setState({position: preferred});
		}
		
		this.setState({active: true});
	},
	closeHandler: function(e) {
		if(!this.state.show) {
			return;
		}
		try {
			if(e.keyCode) {
				if(e.keyCode !== 27) {
					return;
				}
			} else if(ui.isDescendant(ReactDOM.findDOMNode(this), e.target)) {
    			return; // don't close for events that originated in the popover
    		}
		} catch(x) {
			// ignore - e.g. DOM node was removed
		}
		
		this.handleClose();
	},
	componentDidMount: function() {
		if(debug) console.log('adding handlers for popover...');
    	$(document).
    		on('click keyup', this.closeHandler).
    		on('scroll resize', this.positionHandler);
    	
    	if(this.state.show) {
    		this.positionHandler();
    	}
	},
	componentWillUnmount: function() {
		this.setState({active: false});
		if(debug) console.log('removing handlers for popover...');
		$(document).
			off('click keyup', this.closeHandler).
			off('scroll resize', this.positionHandler);
	},
	show: function() {
		this.setState({show: true});
	},
	hide: function() {
		this.setState({show: false});
	},
	handleClose: function() {
		if(this.isMounted()) {
			this.setState({show: false});
			this.replaceState(this.getInitialState()); // reset state
		}
		else {
			this.state.show = false; // ick
		}
		if(this.props.onClose) {
			this.props.onClose();
		}
	},
	render: function() {
		if(!this.state.show) {
			return null;
		}
		return <ui.ClassTransition transitionName="j-ui-popover" transitionEnterTimeout={0} transitionLeaveTimeout={0} transitionAppear={true} transitionAppearTimeout={500}>
			<div key="pop" className={'j-ui-popover active ' + this.state.position + ' ' + this.props.type}>
	           {ui.when(this.props.title, function() { return <h3>{this.props.title}</h3>; })}
	           {this.props.children}
	        </div>
        </ui.ClassTransition>;	
	}
});

/**
 * 
 */
ui.PopoverButton = React.createClass({
	propTyes: {
		label: React.PropTypes.string.isRequired,
		type: React.PropTypes.string,
		onShow: React.PropTypes.func,
		onHide: React.PropTypes.func
	},
	getDefaultProps: function() {
		return {
			position: 'bottom-right',
			type: 'default'
		};
	},
	getInitialState: function() {
		return {
			show: this.props.show ? true : false
		};
	},
	componentWillReceiveProps: function(props) {
		if('show' in props && !ui.isArray(props.show) && props.show !== this.state.show) {
    		this.setState({show: props.show});
	    }
	},
	preShow: function(e) {
		if(this.isShown()) {
			this.state.isHiding = true;
		}
	},
	show: function(e) {
		if(e) {
			e.preventDefault();
			if(this.state.isHiding) { // ick this is for handling clicking the button to close the popover
				this.state.isHiding = false;
				return;
			}
		}
		
		if(ui.isArray(this.props.show)) {
			this.props.show[0][this.props.show[1]] = true;
			this.forceUpdate();
		}
		else {
			this.setState({show: true});
		}
		if(this.props.onShow) {
			this.props.onShow();
		}
	},
	hide: function(e) {
		if(e) {
			e.preventDefault();
		}
		
		if(ui.isArray(this.props.show)) {
			this.props.show[0][this.props.show[1]] = false;
			if(this.isMounted()) {
				this.forceUpdate();
			}
		}
		else {
			if(this.isMounted()) {
				this.setState({show: false});
			}
		}
		
		if(this.props.onHide) {
			this.props.onHide();
		}
	},
	isShown: function() {
		if(ui.isArray(this.props.show)) {
			return true === this.props.show[0][this.props.show[1]];
		}
		return this.state.show;
	},
	render: function() { return (
		<span className="j-ui-wrap">
			<button className={'btn btn-' + this.props.type + (this.isShown() ? ' active' : '')} onMouseDown={this.preShow} onClick={this.show}>
				{this.props.label}
			</button>
			<ui.Popover position={this.props.position} show={this.isShown()} onClose={this.hide}>
				<ui.Panel>
					{ui.getChildrenExclduingType(this.props.children, ui.Actions)}
					<ui.Actions>
		                <ui.Button type="link" onClick={this.hide}>Close</ui.Button>
						{ui.eachChildOfType(this.props.children, ui.Actions, function(child) { return child.props.children; }.bind(this))}
					</ui.Actions>
				</ui.Panel>
			</ui.Popover>
		</span>
	);}
});

/**
 * Helper to conditionally render based on a condition
 */
ui.If = React.createClass({
	getDefaultProps: function() {
		return {
			rendered: false
		};
	},
	render: function() {
		if(this.props.rendered && this.props.children) {
			return <div>{this.props.children}</div>;
		}
		return null;
	},
    propTypes: {
    	rendered: React.PropTypes.bool.isRequired
    }
});

ui.Horizontal = React.createClass({
	getDefaultProps: function() {
		return {
			width: null
		};
	},
	render: function() {
		return <div className="horizontal" style={this.props.width ? this.props.width : ''}>{this.props.children}</div>;
	}
});

/**
 * UI container, holds a spot for actions defined with <ui.Action> ...
 */
ui.Panel = React.createClass({
	getDefaultProps: function() {
		return {
			width: null
		};
	},
	render: function() {
		var actions = null;
		var children = [];
		React.Children.forEach(this.props.children, function(child,i) {
			if(!child) {
				return;
			}
			if(child.type && child.type == ui.Actions) {
				actions = child;
				return;
			}
			children.push(child);
		});
		return <div className="j-ui-panel" style={{width: this.props.width ? this.props.width : ''}}>
			{children}
			{actions}
		</div>;
	}
});

/**
 * A facet placeholder for action blocks
 */
ui.Actions = React.createClass({
	render: function() {
		return <div className="actions">{this.props.children}</div>;
	}
});

/**
 * A simple wrapper around another item which provides a drop-down arrow on hover
 */
ui.ActionMenu = React.createClass({
	getDefaultProps: function() {
		return {
			width: null
		};
	},
	getInitialState: function() {
		return {
			showActions: false
		};
	},
	onShowActions: function() {
		this.setState({showActions: true});
	},
	onHideActions: function() {
		this.setState({showActions: false});
	},
	hide: function() {
		this.onHideActions();
	},
	render: function() {
		var actions = null;
		var renderedChildren = [];
		React.Children.forEach(this.props.children, function(child) {
			if(!child) {
				return;
			}
			if(child.type && child.type == ui.Actions) {
				actions = <div className={'drop-down ' + (this.state.showActions ? ' active' : '')}>
					<div className="toggle" onClick={this.onShowActions}>
						<i className="fa fa-caret-down"></i>
					</div>
					<ui.Popover type="plain" position="bottom-left" fixed={true} show={this.state.showActions} onClose={this.onHideActions}>
						{child.props.children}
					</ui.Popover>
				</div>;
				return;
			}
			renderedChildren.push(child);
		}.bind(this));
		return <div className="action-menu">
			{renderedChildren}
			{actions}
		</div>;
	}
});
