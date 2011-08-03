/**
 * crocos-fbx
 *
 * Copyright (c) 2011 Crocos, Inc.
 *
 * @author Keisuke SATO <sato@crocos.co.jp>
 */

(function($, undefined) {
    $(function() {

        var tagname = function(tagname) {
            return 'fbx\\:'+tagname;
        };

        var arrayChunk = function(array, size) {
            var len = array.length;
            var ret = [];
            var i, f = Math.ceil(len / size);

            for(i=0; i<f; i++) {
                var offset = i * size;
                var p = array.slice(offset, offset + size);
                ret.push(p);
            }

            return ret;
        };

        var arrayUnique = function(array) {
            var storeArr = [];
            var ret = [];
            var i, len = array.length;

            for (i=0; i<len; i++) {
                if (!storeArr[array[i]]) {
                    storeArr[array[i]] = 1;
                    ret[ret.length] = array[i];
                }
            }

            return ret;
        }

        var replaceTag = function(tag, text) {
            tag.after($('<span>').text(text).addClass('-fbx-'+tag.attr('field')));
            tag.remove();
        };

        // fbx:graph
        //
        // attributes:
        //   value
        //   field
        (function() {
            var graph = $(tagname('graph'));
            var fields = {};

            graph.each(function() {
                var tag = $(this);
                var tagField = tag.attr('field');
                if (!fields[tagField]) {
                    fields[tagField] = [];
                }
                fields[tagField][fields[tagField].length] = tag.attr('value');
            });

            $.each(fields, function(field, values) {
                var values = arrayUnique(values);
                var chunkedValues = arrayChunk(values, 20);
                var i, len = chunkedValues.length;

                for (i=0; i<len; i++) {
                    FB.api('?fields='+field+'&ids='+chunkedValues[i].join(','), function(response) {
                        $.each(response, function(id, val) {
                            replaceTag($(tagname('graph')+'[value='+id+'][field='+field+']'), val[field]);
                        });
                    });
                }
            });
        })();

        // fbx:profile
        //
        // attributes
        //   value
        //   field
        (function() {
            var tags = $(tagname('profile'));
            var fields = {};

            tags.each(function() {
                var tag = $(this);
                var tagField = tag.attr('field');
                if (!fields[tagField]) {
                    fields[tagField] = [];
                }
                fields[tagField][fields[tagField].length] = tag.attr('value');
            });

            $.each(fields, function(field, values) {
                var values = arrayUnique(values);
                var chunkedValues = arrayChunk(values, 20);
                var i, len = chunkedValues.length;

                for (i=0; i<len; i++) {
                    FB.api({
                        method: 'fql.query',
                        query: 'SELECT id,'+field+' FROM profile WHERE id IN ('+chunkedValues[i].join(',')+')'
                    }, function(response) {
                        $.each(response, function() {
                            replaceTag($(tagname('profile')+'[value='+this.id+'][field='+field+']'), this[field]);
                        });
                    });
                }
            });
        })();

    });
})(jQuery);
