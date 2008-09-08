var fileTable = Class.create();

var fileLink = Class.create();

fileLink.prototype = {
	initialize: function(link) {
		this.linkElement = link;
		if (link.getAttribute("href") == "#")
			link.removeAttribute("href");
		this.url = "#";
		if (link.getAttribute("href") != null)
			this.url = link.getAttribute("href");
		if (link.getAttribute("url") != null)
			this.url = link.getAttribute("url");
	},
	
	refreshLinkVersion: function(new_version) {
		asset_lock = new_version;
		var old_version = this.getVersion();
		this.url = this.url.replace("v=" + old_version, "v=" + new_version);
		this.url = this.url.replace("&v=" + old_version, "&v=" + new_version);
		this.linkElement.setAttribute("url", this.url);
		
		if (this.linkElement.getAttribute("href") != null && this.linkElement.getAttribute("href") != "#")
		{
			this.linkElement.setAttribute("href", this.url);
		}
		this.linkElement.setAttribute("url", this.url);
	},
	
	getVersion: function() {
		return parseInt(this.url.substring(this.url.indexOf("v=") + 2, this.url.length));
	}
};

var editNameLink = Class.create(fileLink, { 
	initialize: function($super, link) {
		$super(link);
		link.observe('click', this.editFileName, false);
	},
	
	editFileName: function() {
		var old_value = this.innerHTML;
		var url = this.getAttribute("url");
		var fileSpan = this.up('span');
		
		var tr = this.up('tr');
		var row_id = tr.id.replace("page-", "");
		
		fileSpan.innerHTML = "<input type='text' value='" + old_value + "' name='asset[name]' maxlength='120' id='asset_name_" + row_id + "' class='textbox'/>";

		// $("cancel-" + row_id).show();		
		// $("cancel-" + row_id).setAttribute("url", fileSpan.innerHTML);

		new saveNameLink($("save-" + row_id), url);

		this.stopObserving('click', this.editFileName, false);		
		return false;
	}
});

var saveNameLink = Class.create(fileLink, { 
	initialize: function($super, link, url) {
		$super(link);
		this.linkElement.show();
		this.linkElement.setAttribute("url", url);
		this.url = url;
		
		link.observe('click', this.saveFileName, false);
	},
	
	saveFileName: function() {	
		var url = this.getAttribute("url");
		var row_id = this.id.replace("save-", "");
		var title = this.previous('span');
		
		var new_asset_name = $("asset_name_" + row_id).value;
		
		var params = "authenticity_token=" + auth_token + "&asset%5Bname%5D=" + new_asset_name;
		var request = new Ajax.Request(url, 
			{
				asynchronous:true, evalScripts:true,
				parameters: params,
				onLoading: function() {
					var titles = document.getElementsByClassName("title");
					$("busy-" + row_id).show();
				},
				onSuccess: function(request) {
      				var table_id = $("save-" + row_id).up('table').id;
					title.setAttribute("class", "title");
					$("save-" + row_id).hide();
					$("cancel-" + row_id).hide();
					$("busy-" + row_id).hide();
					var response = request.responseText;
      
					var embTd = "<td class=\"embed\">";
					var embPos = response.indexOf(embTd);
					var embEndPos = response.indexOf("</td>");
					var embInner = response.substring(embPos + embTd.length, embEndPos);
      
					var titleInner = response.substring(0, embPos);
					title.innerHTML = titleInner;
					$("page-" + row_id).down("[class=embed]").innerHTML = embInner;
	  				var row = title.down("a");
	  				url = row.getAttribute("url");
					
					new editNameLink(row);
	   
	  				var version = url.substring(url.indexOf("&v=") + 3, url.length);

					var parentTable = new fileNameTable(table_id);
					var links = parentTable.getLinks();
					for(var i = 0; i < links.length; i++)
					{
						var link = new fileLink(links[i]);
						link.refreshLinkVersion(version);
					}
	    		}
	  		});
	  this.stopObserving('click', this.saveFileName, false);		
	}
});

var fileNameTable = Class.create();

fileNameTable.prototype = {
	initialize: function(table_id) {
		this.table_id = table_id;
		this.trs = this.getChildTrs();
	},
	
	checkPageNumber: function(row_id) {
		var patrn = /^page-\d+$/; 
		if (!patrn.exec(row_id)) 
			return false;
		return true;
	},
	
	getLinks: function() {
		return $(this.table_id).getElementsByTagName("a");
	},
	
	getChildTrs: function() {
		var useTrs = new Array();
		var trs = $(this.table_id).getElementsByTagName("tr");
		for(var i = 0; i < trs.length; i++)
		{
			var row_id = trs[i].getAttribute("id");
			if (this.checkPageNumber(row_id))
			{
				useTrs.push(new fileTableTr(row_id));
			}
		}
		return useTrs;		
	},
	
	getRootTr: function() {
		return $("page-");
	}
};

var fileTableTr = Class.create();

fileTableTr.prototype = {
	
	initialize: function(row_id) {
		this.row_id = row_id;
		new editNameLink(this.getFileNameLink());
	},
	
	getId: function() {
		return parseInt(this.row_id);
	},
	
	haveChild: function() {
		return $(this.row_id).down("[class=expander]");
	},
	
	getFileNameSpan: function() {
		return $(this.row_id).down("span[class=title]");
	},
	
	getFileNameLink: function() {
		return this.getFileNameSpan().down("a");
	},
	
	isFolder: function() {
		return $(this.row_id).down("[class=type]").innerHTML == "Folder";
	},
	
	getEmbed: function() {
		return $(this.row_id).down("[class=embed]");
	},
	
	getAddChildLink: function() {
		return $(this.row_id).down("[class=add-child]").down("a");
	},
	
	getRemoveLink: function() {
		return $(this.row_id).down("[class=remove]").down("a");
	}
};


new fileNameTable("site-map");