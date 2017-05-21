var $J1 = (function (module){
	var _p = module._p = module._p || {};

    _p.projectId = null;

    _p.loadedEntityTypesLabelMap = {};
    _p.loadedEntityTypesIdMap = {};
    _p.loadedEntitySrcRelationIdMap = {};
    _p.loadedEntityTgtRelationIdMap = {};
    _p.loadedSrcTgtRelationMap = {};
    _p.loadedRelationTypesIdMap = {};
    _p.loadedRelationPropLabelMap = {};
    _p.loadedTypeSystemDiagram = {};
    _p.viewType="L";
    _p.SelectedEntity=null;
    var diagramViewEle = $("#diagramView");
    _p.innerMapEle = $("#innerMap");


    _p.init = function(projectId){
        console.log(projectId);
        _p.projectId = projectId;
        var data = {"project_id":projectId};

        _p.innerMapEle.empty();

        $.when(getEntityTypeList(data) , getRelationTypeList(data), getTypeSystemDiagram(data))
        .done(function (entityTypeList, relationTypeList, typeSystemDiagram){

            entityTypeList = entityTypeList[0];
            relationTypeList = relationTypeList[0]
            typeSystemDiagram = typeSystemDiagram[0]





            for (var k in entityTypeList.list) {
                var entityType = entityTypeList.list[k];
                _p.loadedEntityTypesLabelMap[entityType.label] = entityType;
                _p.loadedEntityTypesIdMap[entityType.id] = entityType;
            };

            //map들을 이렇게 많이 만드는건...그냥 피곤해서 더이상 최적화를 못하겠다. 너무 피곤함...
            for (var k in relationTypeList.list) {
                var relationType = relationTypeList.list[k];
                _p.loadedRelationTypesIdMap[relationType.id] = relationType;
                if (!_p.loadedRelationPropLabelMap[relationType.label]){
                    _p.loadedRelationPropLabelMap[relationType.label] = relationType
                };
                var srcTgtRelationId = relationType.srcEntType + "-" + relationType.tgtEntType;
                _p.loadedSrcTgtRelationMap[srcTgtRelationId] = {"shown":false,"connection":null,"relation":relationType};


            };



            for (var k in entityTypeList.list) {
                var entityType = entityTypeList.list[k];
                var entityRelations = $.map(_p.loadedRelationTypesIdMap, function(e){
                    if (e.srcEntType == entityType.id) {
                        return e;
                    }
                });


                for (var i in entityRelations){
                    var relation = entityRelations[i];

                    if (_p.loadedEntitySrcRelationIdMap[entityType.id]){
                        _p.loadedEntitySrcRelationIdMap[entityType.id].relations.push({
                            "id":relation.id,
                            "label":relation.label,
                            "srcEntType":relation.srcEntType,
                            "tgtEntType":relation.tgtEntType,
                        });
                    } else {
                        var newRepRelation = {
                            "relations":[]
                        };
                        newRepRelation.relations.push({
                            "id":relation.id,
                            "label":relation.label,
                            "srcEntType":relation.srcEntType,
                            "tgtEntType":relation.tgtEntType,
                        });
                        _p.loadedEntitySrcRelationIdMap[entityType.id] = newRepRelation;
                    }

                };

            };

            for (var k in entityTypeList.list) {
                var entityType = entityTypeList.list[k];
                var entityRelations = $.map(_p.loadedRelationTypesIdMap, function(e){
                    if (e.tgtEntType == entityType.id) {
                        return e;
                    }
                });


                for (var i in entityRelations){
                    var relation = entityRelations[i];

                    if (_p.loadedEntityTgtRelationIdMap[entityType.id]){
                        _p.loadedEntityTgtRelationIdMap[entityType.id].relations.push({
                            "id":relation.id,
                            "label":relation.label,
                            "srcEntType":relation.srcEntType,
                            "tgtEntType":relation.tgtEntType,
                        });
                    } else {
                        var newRepRelation = {
                            "relations":[]
                        };
                        newRepRelation.relations.push({
                            "id":relation.id,
                            "label":relation.label,
                            "srcEntType":relation.srcEntType,
                            "tgtEntType":relation.tgtEntType,
                        });
                        _p.loadedEntityTgtRelationIdMap[entityType.id] = newRepRelation;
                    }

                };

            };

            if (typeSystemDiagram.result){
                _p.loadedTypeSystemDiagram = typeSystemDiagram.result;
            };
            _p.resetTypeSystemDiagram();
            _p.resetMiniMap();

        });

        resetDiagramUI();

    };



    function getRelationTypeList(data){
        return $.ajax({
            url: Flask.url_for('typesystem.get_relationship_type_list', {project_id: data.project_id})
            ,type: 'POST'
            ,contentType: "application/json;charset=utf-8"
            ,dataType: 'json'
            ,data: JSON.stringify(data)
            ,beforeSend:function(){

            }
        })
    };

    function getEntityTypeList(data){
        return $.ajax({
            url: Flask.url_for('typesystem.get_entity_type_list', {project_id: data.project_id})
            ,type: 'POST'
            ,contentType: "application/json;charset=utf-8"
            ,dataType: 'json'
            ,data: JSON.stringify(data)
            ,beforeSend:function(){

            }
        })
    };

    function getTypeSystemDiagram(data){
        return $.ajax({
            url: Flask.url_for('typesystem.get_type_system_diagram', {project_id: data.project_id})
            ,type: 'POST'
            ,contentType: "application/json;charset=utf-8"
            ,dataType: 'json'
            ,data: JSON.stringify(data)
            ,beforeSend:function(){

            }
        })
    };

    function resetDiagramUI(){

        _p.innerMapEle.draggable().unbind("drag").unbind("dragstop");
        _p.innerMapEle.draggable().bind("drag",function (event, ui) {

        //_p.resetMinimapViewpoint();


        })
        .bind("dragstop",function(event){
            if ($(this).position().left > 0){
                $(this).css("left","0px");
            };
            if ($(this).position().top > 0){
                $(this).css("top","0px");
            };
            _p.resetMinimapViewpoint();
        })
        ;

        $("#diagramView").off("click","**");
        $("#diagramView").on("click","div",function(event){
            var ele = $(this);
            processDiagramClickEvent(ele,event);
        });

        $("#diagramToolbar").off("click","**");
        $("#diagramToolbar").on("click","div,button",function(event){
            var ele = $(this);
            processDiagramToolbarClickEvent(ele,event);
        });
    };

    function processDiagramToolbarClickEvent(ele,event){
        if (ele.is("#btnMaximizeView")){
            event.stopPropagation();
            maximizeDiagramView();

        };

        if (ele.is("#btnNormalView")){
            event.stopPropagation();
            setNormalDiagramView();

        };
        if (ele.is("#btnTSDSave")){
            event.stopPropagation();
            saveTSD();

        };
        if (ele.is("#btnShowRelationEntity")){
            event.stopPropagation();
            showRelationEntity();

        };

        if (ele.is("#btnShowAllEntity")){
            event.stopPropagation();
            showAllEntity();

        };

        if (ele.is("#btnHideAllRelations")){
            event.stopPropagation();
            hideAllRelations();

        };





    };

    function processDiagramClickEvent(ele,event){

        if (ele.hasClass("showRelations")){
            event.stopPropagation();
            var entEle = ele.closest(".entity");
            var entId = _p.getObjectId(entEle);

            var entityRelations = null;
            if (ele.hasClass("outgoing")) {
                entityRelations = _p.loadedEntitySrcRelationIdMap[entId];
                ele.html('Hide Outgoing '+_p.getOutgoingRelationCount(entId)+' <span class="glyphicon glyphicon-arrow-left" aria-hidden="true">');
            } else {
                entityRelations = _p.loadedEntityTgtRelationIdMap[entId];
                ele.html('Hide Incoming '+_p.getIncomingRelationCount(entId)+' <span class="glyphicon glyphicon-arrow-left" aria-hidden="true">');
            };
            ele.removeClass("showRelations");
            ele.addClass("hideRelations");

            _p.drawEntityRelations(entityRelations.relations);
            _p.resetMiniMap();

            return;
        };

        if (ele.hasClass("hideRelations")){
            event.stopPropagation();
            var entEle = ele.closest(".entity");
            var entId = _p.getObjectId(entEle);

            var entityRelations = null;
            if (ele.hasClass("outgoing")) {
                entityRelations = _p.loadedEntitySrcRelationIdMap[entId];
                ele.html('Show Outgoing '+_p.getOutgoingRelationCount(entId)+' <span class="glyphicon glyphicon-arrow-left" aria-hidden="true">');
            } else {
                entityRelations = _p.loadedEntityTgtRelationIdMap[entId];
                ele.html('Show Incoming '+_p.getIncomingRelationCount(entId)+' <span class="glyphicon glyphicon-arrow-left" aria-hidden="true">');
            };
            ele.addClass("showRelations");
            ele.removeClass("hideRelations");

            _p.removeEntityRelations(entityRelations.relations);
            _p.resetMiniMap();

            return;
        };



        if (ele.hasClass("entity")){
            _p.selectEntity(ele);
            event.stopPropagation();
            return;
        };



        if (ele.is(_p.innerMapEle)){
            _p.innerMapEle.find(".thickBox").removeClass("thickBox");
            _p.SelectedEntity = null;
            event.stopPropagation();
        }


    };

    function saveTSD(){
        var saveData = {};

        saveData.typeSystemDiagram = _p.loadedTypeSystemDiagram;

        saveAll(saveData)
        .done(function(result){

        });
    };

    function saveAll(data){
        return $.ajax({
            url: Flask.url_for('typesystem.save_all', {project_id: _p.projectId})
            ,type: 'POST'
            ,contentType: "application/json;charset=utf-8"
            ,dataType: 'json'
            ,data: JSON.stringify(data)
            ,beforeSend:function(){

            }
        })
    };

    function maximizeDiagramView(){
        $("#topContent").removeClass("col-md-10");
        $("#topContent").removeClass("col-md-offset-1");
        $("#topContent").removeClass("main");
        $("#topContent").addClass("leftRightPadding20");
        $("#topContent").find(".maximizeTarget").each(function(index,ele){
            $(ele).css("display","none");
        });
        $("#diagramViewHolder").removeClass("height100");
        $("#diagramViewHolder").addClass("heightPlus120");

    };


    function setNormalDiagramView(){
        $("#topContent").addClass("col-md-10");
        $("#topContent").addClass("col-md-offset-1 ")
        $("#topContent").addClass("main");
        $("#topContent").removeClass("leftRightPadding20");
        $("#topContent").find(".maximizeTarget").each(function(index,ele){
            $(ele).css("display","");
        });
        $("#diagramViewHolder").addClass("height100");
        $("#diagramViewHolder").removeClass("heightPlus120");
    };

    function showRelationEntity(){
        var showList = {};
        for (var k in _p.loadedSrcTgtRelationMap){
            var relationInfo = _p.loadedSrcTgtRelationMap[k];
            if (relationInfo.shown) {
                showList[relationInfo.relation.srcEntType] = 1;
                showList[relationInfo.relation.tgtEntType] = 1;

            }
        };

        if (Object.keys(showList).length > 0){
            for (var k in _p.loadedEntityTypesIdMap){
                var entity = _p.loadedEntityTypesIdMap[k];
                if (showList[entity.id]){
                    _p.showTypeSystemEntity(entity.id);
                } else {
                    _p.hideTypeSystemEntity(entity.id);
                }
            };
            _p.resetMiniMap();
        }
    };

    function showAllEntity(){
        for (var k in _p.loadedEntityTypesIdMap){
            var entity = _p.loadedEntityTypesIdMap[k];
            _p.showTypeSystemEntity(entity.id);
        };
        _p.resetMiniMap();
    };

    function hideAllRelations(){
        for (var k in _p.loadedSrcTgtRelationMap){
            var relationInfo = _p.loadedSrcTgtRelationMap[k];
            if (relationInfo.shown) {
                _p.removeRelation(relationInfo);
            }
        };
    }


    _p.getObjectId = function(obj){
        if (!obj){
            return null;
        }
        if (obj instanceof $){
            return obj.attr("id");
        } else {
            return $(obj).attr("id");
        }
    };




	return module;
}($J1 || {}));