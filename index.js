(function(){

  'use strict';

  /**
   * @see https://github.com/sasaplus1-prototype/history-stack.js
   */
  var HistoryStack = /** @class */ (function () {
      function HistoryStack() {
          this._index = -1;
          this._stack = [];
      }
      HistoryStack.prototype.add = function (history) {
          this._stack.splice(this._index + 1, this._stack.length - this._index, history);
          this._index = this._stack.length - 1;
      };
      HistoryStack.prototype.canRedo = function () {
          return this._index < this._stack.length - 1;
      };
      HistoryStack.prototype.canUndo = function () {
          return this._index >= 0;
      };
      HistoryStack.prototype.redo = function () {
          if (this._index >= this._stack.length) {
              throw new Error('cannot Redo');
          }
          return this._stack[++this._index];
      };
      HistoryStack.prototype.undo = function () {
          if (this._index < 0) {
              throw new Error('cannot Undo');
          }
          return this._stack[this._index--];
      };
      return HistoryStack;
  }());

  //-----

  const editor = document.getElementById('js-editor');
  const undo = document.getElementById('js-undo');
  const redo = document.getElementById('js-redo');
  const message = document.getElementById('js-message');

  const editHistory = new HistoryStack();

  if (editor) {
    function save() {
      const range = document.getSelection().getRangeAt(0);

      editHistory.add({
        range: range.cloneRange(),
        nodes: editor.cloneNode(true),
        date: new Date(),
      });

      message.style.display = '';

      setTimeout(function() {
        message.style.display = 'none';
      }, 1000);

      undo.disabled = !editHistory.canUndo();
      redo.disabled = !editHistory.canRedo();
    }

    editor.addEventListener('keydown', function(event) {
      console.log('keydown', event);

      // NOTE: Android Chrome has not event.code...
      if (!event.isComposing && /* event.code === 'Enter' */ event.keyCode === 13) {
        save();
      }

      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyZ') {
        event.preventDefault();
        undo.click();
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyZ') {
        event.preventDefault();
        redo.click();
      }
    }, false);

    editor.addEventListener('input', function(event) {
      console.log('input', event);

      undo.disabled = !editHistory.canUndo();
      redo.disabled = !editHistory.canRedo();
    }, false);

    undo.addEventListener('click', function() {
      console.log(editHistory._index);

      const history = editHistory.undo();

      console.log(editHistory._index);

      console.log(history.range);
      console.log(history.nodes.childNodes);

      const cloneNodes = history.nodes.cloneNode(true);

      // https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren
      editor.replaceChildren(...cloneNodes.childNodes);

      document.getSelection().removeAllRanges();
      document.getSelection().addRange(history.range);

      undo.disabled = !editHistory.canUndo();
      redo.disabled = !editHistory.canRedo();
    }, false);

    redo.addEventListener('click', function() {
      console.log(editHistory._index);

      const history = editHistory.redo();

      console.log(editHistory._index);

      console.log(history.range);
      console.log(history.nodes.childNodes);

      const cloneNodes = history.nodes.cloneNode(true);

      editor.replaceChildren(...cloneNodes.childNodes);

      document.getSelection().removeAllRanges();
      document.getSelection().addRange(history.range);

      undo.disabled = !editHistory.canUndo();
      redo.disabled = !editHistory.canRedo();
    }, false);
  }

}());
