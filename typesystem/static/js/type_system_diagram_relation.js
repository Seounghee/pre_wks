var $J1 = (function (module){
	var _p = module._p = module._p || {};

    _p.drawEntityRelations = function(relations){


        for (var k in relations){
            var relation = relations[k];

            var srcTgtRelationId = relation.srcEntType + "-" + relation.tgtEntType;
            var srcTgtRelation = _p.loadedSrcTgtRelationMap[srcTgtRelationId];


             //= {"shown":false,"connection":null,"relation":relationType};
            _p.drawRelation(srcTgtRelation);

        };
    };

    _p.drawRelation = function(srcTgtRelation){
        if (!srcTgtRelation.shown){

            var sourceEle = $("#"+srcTgtRelation.relation.srcEntType);
            var targetEle = $("#"+srcTgtRelation.relation.tgtEntType);


            if (!sourceEle.is(":visible")) {
                sourceEle.css("display","");
            };
            if (!targetEle.is(":visible")) {
                targetEle.css("display","");
            };


            var relation = srcTgtRelation.relation;
            var label = relation.label;
            if ($J1._p.currentTypeSystemMode == "L" && relation.logical_value) {
                label = relation.logical_value;
            };

            var connection = jsPlumb.connect({
                source:sourceEle,
                target:targetEle,
                anchor:"Continuous",
                paintStyle:{ strokeWidth:1, stroke:"rgb(131,8,135)" },
                endpoint:["Dot", { radius:1 }],
                connector:["Bezier" , {curviness:90}],
                overlays:[
                    ["Arrow" , { width:5, length:5, location:0.9 }],
                     [ "Label", {label:label, id:relation.id}]
                ]
            });
            jsPlumb.revalidate(srcTgtRelation.relation.srcEntType);
            jsPlumb.revalidate(srcTgtRelation.relation.tgtEntType);
            srcTgtRelation.shown = true;
            srcTgtRelation.connection = connection;
        }



    };

    _p.removeEntityRelations = function(relations){
        for (var k in relations){
            var relation = relations[k];
            var srcTgtRelationId = relation.srcEntType + "-" + relation.tgtEntType;
            var srcTgtRelation = _p.loadedSrcTgtRelationMap[srcTgtRelationId];
            _p.removeRelation(srcTgtRelation);
        };
    };

    _p.removeRelation = function(srcTgtRelation){
        if (srcTgtRelation.shown){
            //jsPlumb.detach(srcTgtRelation.connection);
            jsPlumb.deleteConnection(srcTgtRelation.connection);
            srcTgtRelation.shown = false;
            srcTgtRelation.connection = null;
        };
    };





	return module;
}($J1 || {}));