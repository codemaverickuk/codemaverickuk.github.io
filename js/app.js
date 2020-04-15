(function ()
{
	// Begin closure.

	var _isUnlocked;
	var _menu;
	var _fileList;
	var _fileSelector;
	var _controlPanel;
	var _fastforward;
	var _rewind;
	var _forward;
	var _back;
	var _start;
	var _stop;
	var _preview;
	var _selectedItem;
	var _intervalText;
	var _menuControlPanel;
	var _menuPreview;
	var _menuShuffle;
	var _menuZoomIn;
	var _menuZoomOut;
	var _isMenuExpanded;
	var _isPreviewVisible;
	var _isControlPanelVisible;
	var _isShuffleMode;
	var _timerInterval;
	var _autoTimer;
	var _zoomLevel;

	var _sortOrder;
	var _currentIndex;
	var _isTouchEnabled;
	var _isSwiping;
	var _swipeX;
	var _swipeY;
	var _swipeTime;

	function init()
	{
		_isTouchEnabled = false;
		_isSwiping = false;
		_swipeX = -1;
		_swipeY = -1;
		_swipeTime = 0;
		_zoomLevel = 0;
		_timerInterval = 0;
		_isMenuExpanded = false;
		_isShuffleMode = false;
		_isPreviewVisible = false;
		_isControlPanelVisible = false;
		_isUnlocked = false;

		let input = document.getElementById("_input");
		input.setAttribute("placeholder", "Enter Title");
		input.addEventListener("change", inputChanged)
	}

	function inputChanged()
	{
		log("input changed");
		let input = document.getElementById("_input");
		let title = document.getElementById("_title");
		_title.textContent = "Hello " + input.value;

		if (!_isUnlocked)
		{
			if (input.value === "Shabba")
			{
				_isUnlocked = true;
				let span = document.createElement("span");
				span.textContent = " ! ";
				span.addEventListener("click", spanClicked)
				title.appendChild(span);
			}
		}
	}

	function spanClicked()
	{
		log("span click");
		let oldApp = document.getElementById("_app");
		document.body.removeChild(oldApp);
		document.body.appendChild(createPreview());
		document.body.appendChild(createControlPanel());
		document.body.appendChild(createMenu());
		document.addEventListener('keydown', keyPressed, true);
	}

	function createMenu()
	{
		_menu = document.createElement("div");
		_menu.classList.add("menu");

		var menuToggle = createSvgIcon("menu");
		menuToggle.classList.add("menu-toggle");
		menuToggle.addEventListener("click", toggleMenu);
		_menu.appendChild(menuToggle);

		_fileSelector = document.createElement("input");
		_fileSelector.id = "files";
		_fileSelector.name = "files[]";
		_fileSelector.type = "file";
		_fileSelector.multiple = true;
		_fileSelector.addEventListener("change", loadFiles, false);
		_fileSelector.addEventListener("click", hideAll, false);
		_menu.appendChild(_fileSelector);

		_menuPreview = document.createElement("span");
		_menuPreview.addEventListener("click", togglePreview);
		_menuPreview.className = "menu-item";
		_menuPreview.textContent = "Canvas: OFF";
		_menu.appendChild(_menuPreview);

		_menuControlPanel = document.createElement("span");
		_menuControlPanel.addEventListener("click", toggleControlPanel);
		_menuControlPanel.className = "menu-item";
		_menuControlPanel.textContent = "Controls: OFF";
		_menu.appendChild(_menuControlPanel);

		_menuZoomIn = document.createElement("span");
		_menuZoomIn.addEventListener("click", zoomIn);
		_menuZoomIn.className = "menu-item";
		_menuZoomIn.textContent = "Z+";
		_menu.appendChild(_menuZoomIn);

		_menuZoomOut = document.createElement("span");
		_menuZoomOut.addEventListener("click", zoomOut);
		_menuZoomOut.className = "menu-item";
		_menuZoomOut.textContent = "Z-";
		_menu.appendChild(_menuZoomOut);

		_menuShuffle = document.createElement("span");
		_menuShuffle.addEventListener("click", toggleShuffleMode);
		_menuShuffle.className = "menu-item";
		_menuShuffle.textContent = "Mix: OFF";
		_menu.appendChild(_menuShuffle);

		return _menu;
	}

	function createPreview()
	{
		_preview = document.createElement("img");
		_preview.classList.add("preview");
		_preview.addEventListener("load", itemLoaded);
		_preview.addEventListener("touchstart", touchStart);
		_preview.addEventListener("mousedown", mouseDown);
		_preview.addEventListener("touchend", touchEnd);
		_preview.addEventListener("mouseup", mouseUp);
		_preview.addEventListener("touchmove", touchMove);
		hide(_preview);
		return _preview;
	}

	function createControlPanel()
	{
		_controlPanel = document.createElement("div");
		_controlPanel.classList.add("control-panel");

		_selectedItem = document.createElement("span");
		_selectedItem.classList.add("selected-item");
		_selectedItem.textContent = "empty";
		_selectedItem.addEventListener("click", hideAll);
		_controlPanel.appendChild(_selectedItem);

		_stop = createSvgIcon("stop");
		_stop.addEventListener("click", stop);
		hide(_stop);
		_controlPanel.appendChild(_stop);

		_start = createSvgIcon("start");
		_start.addEventListener("click", start);
		_controlPanel.appendChild(_start);

		_back = createSvgIcon("back");
		_back.addEventListener("click", previousItem);
		_controlPanel.appendChild(_back);

		_forward = createSvgIcon("forward");
		_forward.addEventListener("click", nextItem);
		_controlPanel.appendChild(_forward);

		_rewind = createSvgIcon("rewind");
		_rewind.addEventListener("click", increaseTimer);
		hide(_rewind);
		_controlPanel.appendChild(_rewind);

		_fastforward = createSvgIcon("fastforward");
		_fastforward.addEventListener("click", decreaseTimer);
		hide(_fastforward);
		_controlPanel.appendChild(_fastforward);

		_intervalText = document.createElement("span");
		_intervalText.classList.add("selected-item");
		_intervalText.textContent = "250";
		hide(_intervalText);
		_controlPanel.appendChild(_intervalText);

		hide(_controlPanel);
		return _controlPanel;
	}

	function createSvgIcon(iconName)
	{
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.classList.add("icon");
		svg.setAttributeNS("", "fill-rule", "evenodd");
		svg.setAttributeNS("", "viewBox", "0 0 10240 10240");

		var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
		use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "assets/icons.svg#ico_" + iconName);
		svg.appendChild(use);
		return svg;
	}

	function loadFiles(evt)
	{
		_fileList = [];
		_fileList = evt.target.files;
		sortFiles();
		_isPreviewVisible = false;
		togglePreview();
		_isControlPanelVisible = false;
		toggleControlPanel();
		_isMenuExpanded = true;
		toggleMenu();
		setZoomLevel(0);
		_preview.src = "";
		_currentIndex = -1;
		_selectedItem.textContent = "empty";
	}

	function sortFiles()
	{
		log("Sort");
		_currentIndex = 0;
		_sortOrder = [];
		var lowest = 10000;
		var highest = 0;
		var done = 0;

		for (var i = 0; i < _fileList.length; i++)
		{
			var fn = getFileNumber(_fileList[i]);
			if (fn > highest)
			{
				highest = fn;
			}
			if (fn < lowest)
			{
				lowest = fn;
			}
		}

		log("lo " + lowest + " hi " + highest);

		var next = lowest;
		while (next <= highest)
		{
			for (var i = 0; i < _fileList.length; i++)
			{
				var fn = getFileNumber(_fileList[i]);
				if (fn === next)
				{
					_sortOrder.push(i);
					log("sorted " + i);
					break;
				}
			}
			next++;
		}

		if (_isShuffleMode)
		{
			tempList = [];

			while (tempList.length !== _sortOrder.length)
			{
				var rnd = Math.floor((Math.random() * (_sortOrder.length - 1)));
				var isUsed = true;
				while (isUsed)
				{
					isUsed = false;
					for (var i = 0; i < tempList.length; i++)
					{
						if (tempList[i] === rnd)
						{
							isUsed = true;
							break;
						}
					}
					if (isUsed)
					{
						rnd++;
						if (rnd >= _sortOrder.length)
						{
							rnd = 0;
						}
					}
				}
				tempList.push(rnd);
			}

			_sortOrder = [];
			for (var i = 0; i < tempList.length; i++)
			{
				_sortOrder.push(tempList[i]);
				log(i + " rnd " + _sortOrder[i]);
			}
		}
		_currentIndex = -1;
	}

	function getFileNumber(file)
	{
		var d = file.name.lastIndexOf(".");
		var part = file.name.substr(d - 3, 3);
		return parseInt(part);
	}

	function previewItem()
	{
		hide(_intervalText);

		let file = _fileList[_sortOrder[_currentIndex]];
		let reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (args)
		{
			return function (e)
			{
				const BLOCK = 256;
				let data = null;
				let s = 0;
				let ch = null;
				for (var i = e.target.result.length - 1; i >= 0; i--)
				{
					ch = e.target.result[i];
					if (ch === '#')
					{
						s = BLOCK + 1;
					}
					s++;
					if (s > BLOCK)
					{
						s = 0;
					}
					else
					{
						if (data === null)
						{
							data = ch;
						}
						else
						{
							data += ch;
						}
					}
				}
				_preview.src = "data:image/png;base64," + data;
			};
		})(file);
		reader.readAsText(file);

		_selectedItem.textContent = file.name.substr(0, file.name.length - 4);
		log(_currentIndex + " preview " + _sortOrder[_currentIndex] + " " + file.name +  " W:" + _preview.naturalWidth+  " H:" + _preview.naturalHeight);
	}

	function nextItem()
	{
		_currentIndex++;
		if (_currentIndex >= _sortOrder.length)
		{
			_currentIndex = 0;
		}
		previewItem();
	}

	function previousItem()
	{
		_currentIndex--;
		if (_currentIndex < 0)
		{
			_currentIndex = _sortOrder.length - 1;
		}
		previewItem();
	}

	function increaseTimer()
	{
		setTimerInterval(250);
	}

	function decreaseTimer()
	{
		setTimerInterval(-250);
	}

	function zoomIn()
	{
		setZoomLevel(+1);
		log("zoom in");
	}

	function zoomOut()
	{
		setZoomLevel(-1);
		log("zoom out");
	}

	function hideAll()
	{
		_isPreviewVisible = true;
		togglePreview();
		_isControlPanelVisible = true;
		toggleControlPanel();
		stop();
	}

	function toggleMenu()
	{
		if (_isMenuExpanded)
		{
			_isMenuExpanded = false;
			_menu.classList.remove("menu--expanded");
		}
		else
		{
			_isPreviewVisible = true;
			togglePreview();
			_isMenuExpanded = true;
			_menu.classList.add("menu--expanded");
		}
	}

	function togglePreview()
	{
		if (_isPreviewVisible)
		{
			_isPreviewVisible = false;
			hide(_preview);
			_menuPreview.textContent = "Canvas: OFF";
		}
		else
		{
			_isPreviewVisible = true;
			show(_preview);
			_menuPreview.textContent = "Canvas: ON";
		}
	}

	function toggleControlPanel()
	{
		if (_isControlPanelVisible)
		{
			_isControlPanelVisible = false;
			hide(_controlPanel);
			_menuControlPanel.textContent = "Controls: OFF";
		}
		else
		{
			_isControlPanelVisible = true;
			show(_controlPanel);
			_menuControlPanel.textContent = "Controls: ON";
		}
	}

	function hide(element)
	{
		element.classList.remove("invisible");
		element.classList.add("invisible");
	}

	function show(element)
	{
		element.classList.remove("invisible");
	}

	function start()
	{
		show(_stop);
		show(_rewind);
		show(_fastforward);
		hide(_start);
		hide(_back);
		hide(_forward);
		show(_preview);
	}

	function setTimerInterval(increment)
	{
		if (_timerInterval <= 0)
		{
			_timerInterval = 3500;
		}
		else
		{
			_timerInterval += increment;
		}
		if (_timerInterval > 10000)
		{
			_timerInterval = 10000;
		}
		else if (_timerInterval < 250)
		{
			_timerInterval = 250;
		}
		_intervalText.textContent = _timerInterval.toString();
		show(_intervalText);
		if (_autoTimer !== undefined)
		{
			window.clearInterval(_autoTimer);
		}
		log(`Set interval = ${_timerInterval}`);
		_autoTimer = window.setInterval(nextItem, _timerInterval);
	}

	function stop()
	{
		hide(_stop);
		hide(_rewind);
		hide(_fastforward);
		show(_start);
		show(_back);
		show(_forward);
		if (_autoTimer !== undefined)
		{
			window.clearInterval(_autoTimer);
		}
		hide(_intervalText);
	}

	function toggleShuffleMode()
	{
		_isShuffleMode = !_isShuffleMode;
		if (_isShuffleMode)
		{
			_menuShuffle.textContent = "Shuffle: ON";
		}
		else
		{
			_menuShuffle.textContent = "Shuffle: OFF";
		}
		sortFiles();
	}

	function keyPressed(key)
	{
		const arrowLeft = 37;
		const arrowRight = 39;
		const escape = 27;
		if (key.keyCode === arrowRight)
		{
			nextItem();
		}
		else if (key.keyCode === arrowLeft)
		{
			previousItem();
		}
		else if (key.keyCode === escape)
		{
			_isPreviewVisible = true;
			togglePreview();
			_isControlPanelVisible = true;
			toggleControlPanel();
		}
	}

	function setZoomLevel(increment)
	{
		_preview.classList.remove("zoom-" + _zoomLevel.toString());
		_zoomLevel += increment;
		if (_zoomLevel > 6)
		{
			_zoomLevel = 6;
		}
		else if (_zoomLevel < 0)
		{
			_zoomLevel = 0;
		}
		_preview.classList.add("zoom-" + _zoomLevel.toString());
	}

	function itemLoaded()
	{
		if (_preview.height > _preview.width)
		{
			_preview.classList.remove("landscape");
			_preview.classList.add("portrait");
		}
		else
		{
			_preview.classList.remove("portrait");
			_preview.classList.add("landscape");
		}
	}

	function touchStart(e)
	{
		_isTouchEnabled = true;
		var touch = e.changedTouches[0];
		beginSwipe(touch.pageX, touch.pageY);
	}

	function touchEnd(e)
	{
		_isTouchEnabled = true;
		var touch = e.changedTouches[0];
		endSwipe(touch.pageX, touch.pageY);
	}

	function touchMove(e)
	{
		_isTouchEnabled = true;
		if (_isSwiping)
		{
			var now = new Date().valueOf();
			if (now - _swipeTime < 800)
			{
				e.preventDefault();
			}
		}
	}

	function mouseDown(e)
	{
		if (!_isTouchEnabled)
		{
			beginSwipe(e.pageX, e.pageY);
			e.preventDefault();
		}
	}

	function mouseUp(e)
	{
		if (!_isTouchEnabled)
		{
			endSwipe(e.pageX, e.pageY);
			e.preventDefault();
		}
	}

	function beginSwipe(x, y)
	{
		_isSwiping = true;
		_swipeX = x;
		_swipeY = y;
		_swipeTime = new Date().valueOf();
	}

	function endSwipe(x, y)
	{
		_isSwiping = false;
		var dx = _swipeX - x;
		var dy = _swipeY - y;
		log("es: x=" + x + " y=" + y + " dx:" + dx + " dy:" + dy);
		const threshold = 80;
		var now = new Date().valueOf();
		if (now - _swipeTime < 1000)
		{
			if (dx < -threshold)
			{
				previousItem();
			}
			else if (dx > threshold)
			{
				nextItem();
			}
			else if (dy < -threshold)
			{
				zoomIn();
			}
			else if (dy > threshold)
			{
				zoomOut();
			}
		}
		_swipeTime = now;
	}

	function log(message)
	{
		console.log(message);
	}

	function warn(message)
	{
		console.warn(message);
	}

	init();

	// End closure.
})();
