var MyWidget = SuperWidget.extend({
    //variáveis da widget
    variavelNumerica: null,
    variavelCaracter: null,
    contTabela: 0,
    delTable: [],

    //método iniciado quando a widget é carregada
    init: function () {


        var dsTarefa = DatasetFactory.getDataset("dts_consultaTarefasMFX").values;
        criaTable(dsTarefa)
        createFilter('#ztxt_busca_categoria', 'dts_consultaCategoriaMFX', '')
    },

    //BIND de eventos
    bindings: {
        local: {
            'execute': ['click_executeAction']
        },
        global: {}
    },

    executeAction: function (htmlElement, event) {
    },

});

class Ged {
    constructor(){}

    save(formData) {
        $.ajax({
            async: false,
            url: '/api/public/2.0/cards/create',
            type: "POST",
            contentType: "application/json",
            Accept: "text/html",
            data: formData,
            success: function (data) {
                $('#loading-oba').show()
                console.log(data);
                console.log('Criado com sucesso')
                FLUIGC.toast({
                    title: 'Cadastro de Categoria: <br>',
                    message: 'Realizado com sucesso',
                    type: 'success'
                });
                $('#loading-oba').hide()
            },
            error: function (data, errorThrown, status) {
                console.log('Deu erro!')
            }
        });
    }

    delete(documentId){
        $.ajax({
            async: false,
            url: "/api/public/2.0/cardindexes/delete/" + documentId,
            method: "POST",
            timeout: 0,
            headers: {
                "Content-Type": "application/json"
            },
            success: function (data) {
                $('#loading-oba').show()
                console.log(data);
                console.log(documentId);
                console.log('Excluído com sucesso')
                $('#loading-oba').hide()
                $('#hd_cod_documento').val('')
            },
            error: function (data, errorThrown, status) {
                console.log('Deu erro!')
                $('#hd_cod_documento').val('')
            }
        });
    }
}

function salvarGed() {
    $('#loading-oba').show()
    if (campoObrigatorio()) {
        const instance = new Ged()
        $("input[id^='ztxt_nome_categoria___']").each(function (index, e) {
            
            const id = this.id.split('___')[1].split('_tb')[0]
            const infosCadTarefa = {
                idTipoAtendimento   : $("#hd_cod_tpAtend___" + id).val(),
                nomeTipoAtendimento : $("#ztxt_nome_tpAtend___" + id + "_tb").val(),
                idCategoria         : $("#hd_cod_categoria___" + id).val(),
                nomeCategoria       : $("#ztxt_nome_categoria___" + id + "_tb").val(),
                tarefa              : $("#txt_tarefa___" + id + "_tb").val(),
                tipoSolic           : $('#txt_tipo___' + id + '_tb option:selected').text(),
                slaSolic            : $(`#txt_slaSolic___${id}_tb`).val()
            }
            
            const dados = {
                "parentDocumentId": 1767532, // código do formulario "pai" (homol: 1767532) (prod: 1767532)
                "version": 1000, //versão
                "inheritSecurity": true,
                "formData": [ // lista dos campos 
                    {
                        "name"  : "txt_id_categoria",
                        "value" : infosCadTarefa.idCategoria
                    }, 
                    {
                        "name"  : "hd_nome_categ",
                        "value" : infosCadTarefa.nomeCategoria
                    },
                    {
                        "name"  : "txt_id_tipoAtend",
                        "value" : infosCadTarefa.idTipoAtendimento
                    },
                    {
                        "name"  : "hd_nome_tpAtend",
                        "value" : infosCadTarefa.nomeTipoAtendimento
                    },
                    {
                        "name"  : "txt_tarefa",
                        "value" : infosCadTarefa.tarefa
                    },
                    {
                        "name"  : "sl_tarefa_tiposolic",
                        "value" : infosCadTarefa.tipoSolic
                    },
                    {
                        "name"  : "txt_tarefa_slaSolic",
                        "value" : infosCadTarefa.slaSolic
                    }
                ]
            }
            
            const documentid = $('#hd_cod_documento').val()

            documentid != '' ? instance.delete(documentid) : ""

            const formData = JSON.stringify(dados);

           instance.save(formData)

        });
        $('#tbody_cadastraCategoria').html('')
        const dtsTarefa = DatasetFactory.getDataset("dts_consultaTarefasMFX").values;
        criaTable(dtsTarefa)
    }

    $('#loading-oba').hide()
}

function criaTable(dataset_values) {
    $('#tarefas').html('')

    for (var i = 0; i < dataset_values.length; i++) {
        const linha = $("<div class='line row'>")
        const colunas = `
        
            <div class="content-line col-md-1"> 
                <span>${dataset_values[i].DOCUMENTID}</span>
            </div>
            <div class="content-line col-md-2"> 
                <span>${dataset_values[i].HD_NOME_CATEG}</span>
                <input type='hidden' id='hd_cod_categ_${i}' name='hd_cod_categ_${i}' value='${dataset_values[i].TXT_ID_CATEGORIA}' />
            </div>
            <div class="content-line col-md-2"> 
                <span>${dataset_values[i].HD_NOME_TPATEND}</span>
                <input type='hidden' id='hd_cod_atend_${i}' name='hd_cod_atend_${i}' value='${dataset_values[i].TXT_ID_TIPOATEND}'>
            </div>
            <div class="content-line col-md-2"> 
                <span>${dataset_values[i].TXT_TAREFA}</span>
            </div>
            <div class="content-line col-md-2"> 
                <span>${dataset_values[i].SL_TAREFA_TIPOSOLIC}</span>
            </div>
            <div class="content-line col-md-1"> 
                <span>${dataset_values[i].SLA_SOLIC.trim() == "" ? "----" : dataset_values[i].SLA_SOLIC.trim() + " h" }</span>
            </div>
            <div class="content-button col-md-2"> 
                <button type="button" class="btn btn-warning" onclick="editaRegistro(this)">Editar</button>
                <button type="button" class="btn btn-danger" style="margin-left: 10px;" onclick="deletaRegistro(this)">Excluir</button>
            </div>
        `
        linha.append(colunas)
        $('#tarefas').append(linha)
    }
}

function addNovo(values) {
    $('#btn-save').attr('disabled', false)
    MyWidget.contTabela++;
    if (values) {
        filter_atendimento = undefined
        const infosCateg = {
            IdCatego: values.filter_categoria.TXT_ID_CATEGORIA,
            IdAtendi: values.filter_tpAtendimento.TXT_ID_TIPOATEND,
            tarefa: values.descricao_tarefa,
            tipoSolic: values.tipo_solic,
            slaUser: values.slaUser,
            row: $("<tr>")
        }

        const cols = `
            <td class="col-md-1">
                <div id="delet_row___${MyWidget.contTabela}_tb" onclick="deleteTabela(this)">
                    <span class="fluigicon fluigicon-trash fluigicon-md"></span>
                </div>
            </td>
            
            <td class="col-md-2">
                <input class="cp_obrigatorio form-control" type="text" id="ztxt_nome_categoria___${MyWidget.contTabela}_tb" name="ztxt_id_categoria___${MyWidget.contTabela}_tb" onchange="getItem(this)">
            </td>
            
            <input type="hidden" id="hd_cod_categoria___${MyWidget.contTabela}" name="hd_cod_categoria___${MyWidget.contTabela}" value="${infosCateg.IdCatego}">
            
            <td class="col-md-3">
                <input class="cp_obrigatorio form-control input" type="text" id="ztxt_nome_tpAtend___${MyWidget.contTabela}_tb" name="ztxt_nome_tpAtend___${MyWidget.contTabela}_tb" onchange="getItemAtendimento(this)">
            </td>
            <input type="hidden" id="hd_cod_tpAtend___${MyWidget.contTabela}" name="hd_cod_tpAtend___${MyWidget.contTabela}" value="${infosCateg.IdAtendi}">
            
            <td class="col-md-3">
                <input class="cp_obrigatorio form-control input" type="text" id="txt_tarefa___${MyWidget.contTabela}_tb" name="txt_tarefa___${MyWidget.contTabela}_tb"  value="${infosCateg.tarefa}">
            </td>
            
            <td class="col-md-2">
                <select class="cp_obrigatorio form-control input" type="text" id="txt_tipo___${MyWidget.contTabela}_tb" name="txt_tipo___${MyWidget.contTabela}_tb">
                    <option value="1">Incidente</option>
                    <option value="2">Melhoria</option>
                    <option value="3">Requisição de Serviço</option>
                </select>
            </td>
            
            <td class="col-md-1">
                <input class="cp_obrigatorio form-control input" type="text" id="txt_nome_sla___${MyWidget.contTabela}_tb" name="ztxt_nome_sla___${MyWidget.contTabela}_tb" onchange="getItemAtendimento(this)">
            </td>
        `

        /* Add na linha 236: 
        <td class="col-md-2">
                <input class="cp_obrigatorio form-control input" type="text" id="txt_slaSolic___${MyWidget.contTabela}_tb" name="txt_slaSolic___${MyWidget.contTabela}_tb"  value="${infosCateg.slaUser == "----" ? "" : infosCateg.slaUser}">
            </td>*/

        infosCateg.row.append(cols);
        $('#tbody_cadastraCategoria').append(infosCateg.row);
        switch (infosCateg.tipoSolic) {
            case "Incidente":
                $('#txt_tipo___' + MyWidget.contTabela + '_tb').val('1')
                break;
            case "Melhoria":
                $('#txt_tipo___' + MyWidget.contTabela + '_tb').val('2')
                break;
            case "Requisição de Serviço":
                $('#txt_tipo___' + MyWidget.contTabela + '_tb').val('3')
                break;
            default:
                break;
        }

        createFilter('#ztxt_nome_categoria___' + MyWidget.contTabela + '_tb', 'dts_consultaCategoriaMFX')

        filter_categ.add(values.filter_categoria)
        filter_atendimento.add(values.filter_tpAtendimento);

    } else {
        const row = $("<tr>");
        filter_atendimento = undefined

        const cols = `
            <td class="col-md-1">
                <div id="delet_row___${MyWidget.contTabela}_tb" onclick="deleteTabela(this)">
                    <span class="fluigicon fluigicon-trash fluigicon-md"></span>
                </div>
            </td>
            <td class="col-md-3">
                <input class="cp_obrigatorio form-control" type="text" id="ztxt_nome_categoria___${MyWidget.contTabela}_tb" name="ztxt_id_categoria___${MyWidget.contTabela}_tb" onchange="getItem(this)">
                <input type="hidden" id="hd_cod_categoria___${MyWidget.contTabela}" name="hd_cod_categoria___${MyWidget.contTabela}">
            </td>
            <td class="col-md-2">
                <input class="cp_obrigatorio form-control input" type="text" id="ztxt_nome_tpAtend___${MyWidget.contTabela}_tb" readonly name="ztxt_nome_tpAtend___${MyWidget.contTabela}_tb" onchange="getItemAtendimento(this)">
                <input type="hidden" id="hd_cod_tpAtend___${MyWidget.contTabela}" name="hd_cod_tpAtend___${MyWidget.contTabela}">
            </td>
            <td class="col-md-2">
                <input class="cp_obrigatorio form-control input" type="text" id="txt_tarefa___${MyWidget.contTabela}_tb" name="txt_tarefa___${MyWidget.contTabela}_tb">
            </td>
            <td class="col-md-2">
                <select class="cp_obrigatorio form-control input" type="text" id="txt_tipo___${MyWidget.contTabela}_tb" name="txt_tipo___${MyWidget.contTabela}_tb">
                    <option value="1">Incidente</option>
                    <option value="2">Melhoria</option>
                    <option value="3">Requisição de Serviço</option>
                </select>
            </td>
            <td class="col-md-2">
                <input class="cp_obrigatorio form-control input" type="number" id="txt_slaSolic___${MyWidget.contTabela}_tb" name="txt_slaSolic___${MyWidget.contTabela}_tb" />
            </td>
        `

        row.append(cols);
        $('#tbody_cadastraCategoria').append(row);
        $("#tbody_cadastraCategoria").append(`<button type="button" class="btn btn-default btn_add" id="btn_addDesc" onclick="addDesc(${MyWidget.contTabela})">Cadastrar Nova Descrição</button> <div id="tab_cadastraDescricao___${MyWidget.contTabela}"></div>`)
        createFilter('#ztxt_nome_categoria___' + MyWidget.contTabela + '_tb', 'dts_consultaCategoriaMFX')

    }

}

function getItem(itens) {

    var index = itens.id.split('___')[1].split('_tb')[0]
    if (filter_categ.getSelectedItems()[0] != undefined) {
        var getSelected = filter_categ.getSelectedItems()[0]['TXT_ID_CATEGORIA']
        $('#hd_cod_categoria___' + index).val(getSelected)

        var constraint = DatasetFactory.createConstraint('IDCATEG', getSelected, getSelected, ConstraintType.MUST)
        var dts_atendimento = DatasetFactory.getDataset('dts_consultaTpAtendMFX', null, [constraint], null).values

        $('#ztxt_nome_tpAtend___' + index + '_tb').attr('readonly', false)
        createFilter('#ztxt_nome_tpAtend___' + index + '_tb', 'dts_tipoAtendimento', dts_atendimento)
    } else {
        filter_atendimento.removeAll()
    }
}

function getItemAtendimento(item_atendimento) {
    var index = item_atendimento.id.split('___')[1].split('_tb')[0]
    if (filter_atendimento.getSelectedItems()[0] != undefined) {
        var getSelected = filter_atendimento.getSelectedItems()[0]['TXT_ID_TIPOATEND']
        $('#hd_cod_tpAtend___' + index).val(getSelected)
    } else {
        $('#hd_cod_tpAtend___' + index).val('')
    }
}

let filter_atendimento, filter_categ, filter_pesquisa_categ, filter_pesquisa_tpAtend, filter_taskCat, filter_taskType;
function createFilter(campo, dts, reload) {
    if (dts == 'dts_tipoAtendimento') {
        var tpatend = {
            source: reload,
            displayKey: 'TXT_TIPO_ATENDIMENTO',
            style: {
                autocompleteTagClass: 'tag-oba',
                tableSelectedLineClass: 'info'
            },
            table: {
                header: [{
                    'title': 'ID Categoria',
                    'dataorder': 'TXT_ID_TIPOATEND'
                },
                {
                    'title': 'Categoria',
                    'dataorder': 'TXT_TIPO_ATENDIMENTO',
                    'standard': true
                }],
                renderContent: ['TXT_ID_TIPOATEND', 'TXT_TIPO_ATENDIMENTO']
            }
        };
        if (campo == '#ztxt_busca_tpAtend') {
            filter_pesquisa_tpAtend == undefined ? filter_pesquisa_tpAtend = FLUIGC.filter(campo, tpatend) : filter_pesquisa_tpAtend.reload(tpatend)

        } else {
            filter_atendimento == undefined ? filter_atendimento = FLUIGC.filter(campo, tpatend) : filter_atendimento.reload(tpatend)
        }

    } else if (dts == 'dts_consultaCategoriaMFX') {
        var dts_categ = DatasetFactory.getDataset(dts, null, null, null).values
        var categoria = {
            source: dts_categ,
            displayKey: 'TXT_CATEGORIA',
            style: {
                autocompleteTagClass: 'tag-oba',
                tableSelectedLineClass: 'info'
            },
            table: {
                header: [{
                    'title': 'ID Categoria',
                    'dataorder': 'TXT_ID_CATEGORIA',
                    'standard': true
                },
                {
                    'title': 'Categoria',
                    'dataorder': 'TXT_CATEGORIA'
                }],
                renderContent: ['TXT_ID_CATEGORIA', 'TXT_CATEGORIA']
            }
        };
        if (campo == '#ztxt_busca_categoria') {
            filter_pesquisa_categ = FLUIGC.filter(campo, categoria)
        } else {
            filter_categ = FLUIGC.filter(campo, categoria)
        }
    }

}

function filtraFilter() {
    if (filter_pesquisa_categ.getSelectedItems()[0]) {

        var getSelected = filter_pesquisa_categ.getSelectedItems()[0]['TXT_ID_CATEGORIA']
        var constraint = DatasetFactory.createConstraint('IDCATEG', getSelected, getSelected, ConstraintType.MUST)
        var dts_atendimento = DatasetFactory.getDataset('dts_consultaTpAtendMFX', null, [constraint], null).values

        $('#ztxt_busca_tpAtend').attr('readonly', false)
        createFilter('#ztxt_busca_tpAtend', 'dts_tipoAtendimento', dts_atendimento)
    } else {
        filter_pesquisa_tpAtend.removeAll();
    }
}

function limpaFiltro() {
    filter_pesquisa_categ.removeAll()
    filter_pesquisa_tpAtend.removeAll()
    var dts = DatasetFactory.getDataset("dts_consultaTarefasMFX", null, null, null).values;
    criaTable(dts)
}

function pesquisaFiltro() {
    var filter_categoria = filter_pesquisa_categ.getSelectedItems()[0]
    var tipo_atendimento = filter_pesquisa_tpAtend.getSelectedItems()[0]

    var montaQuery = []
    var query = '';

    if (filter_categoria) {
        var id_categoria = filter_categoria['TXT_ID_CATEGORIA']
        montaQuery.push(" AND mlTrf.TXT_ID_CATEGORIA = '" + id_categoria + "'")
    }
    if (tipo_atendimento) {
        var id_tpAtendimento = tipo_atendimento['TXT_ID_TIPOATEND']
        montaQuery.push(" AND mlTrf.TXT_ID_TIPOATEND = '" + id_tpAtendimento + "'")
    }

    for (var index = 0; index < montaQuery.length; index++) {
        if (montaQuery.length > 0) {
            query += montaQuery[index]
        }
    }

    if (query) {
        var constraint_tipoAtend = DatasetFactory.createConstraint('FILTRA_TAREFAS', query, query, ConstraintType.MUST)
        var dts_filtrado = DatasetFactory.getDataset("dts_consultaTarefasMFX", null, [constraint_tipoAtend], null).values;

        if (dts_filtrado.length > 0) {
            criaTable(dts_filtrado)
        } else {
            FLUIGC.toast({
                title: 'Pesquisa inválida <br>',
                message: 'Tarefa não encontrado no sistema.',
                type: 'warning'
            });
        }
    } else {
        FLUIGC.toast({
            title: 'Pesquisa inválida <br>',
            message: 'Adicione ao menos um filtro.',
            type: 'warning'
        });
    }
}

function deleteTabela(id) {
    var index = $(id)[0].outerHTML.split("___")[1].split('_tb')[0]
    MyWidget.delTable.push(index);
    $(id.parentNode.parentNode).remove();
    filter_atendimento = undefined
    $('#hd_cod_documento').val('')
}

function editaRegistro(html) {
    if ($('#tbody_cadastraCategoria tr').length == 0) {
        const id_documento = html.parentElement.parentElement.children[0].children[0].innerHTML;
        $("#hd_cod_documento").val(id_documento)

        const paramsEdit = {
            filter_categoria: {
                TXT_ID_CATEGORIA: html.parentElement.parentElement.children[1].children[1].value,
                TXT_CATEGORIA: html.parentElement.parentElement.children[1].children[0].innerHTML
            },
            filter_tpAtendimento: {
                TXT_ID_TIPOATEND: html.parentElement.parentElement.children[2].children[1].value,
                TXT_TIPO_ATENDIMENTO: html.parentElement.parentElement.children[2].children[0].innerHTML
            },
            descricao_tarefa: html.parentElement.parentElement.children[3].children[0].innerHTML.trim(),
            tipo_solic: html.parentElement.parentElement.children[4].children[0].innerHTML,
            slaUser: html.parentElement.parentElement.children[5].children[0].innerHTML
        }

        addNovo(paramsEdit)
        $('html, body').animate({ scrollTop: 0 }, 1000);
    } else {
        FLUIGC.toast({
            title: 'Edição interrompida! <br>',
            message: 'Somente é permitido a edição de um registro.',
            type: 'danger'
        });

    }
}


function deletaRegistro(registro) {
    const id_documento = registro.parentNode.parentNode.children[0].children[0].innerHTML
    $("#hd_cod_docs_exclui").val(id_documento)
    
    const modalConfirmacao = FLUIGC.modal({
        title: 'Exclusão',
        content: '<p>Você tem certeza que deseja excluir este registro?</p>',
        id: 'modal_exclusão',
        size: 'large',
        actions: [{
            'label': 'Sim',
            'bind': 'data-sim-req',
            'classType': 'btn btn-danger btn-block',
            'autoClose': true
        }, {
            'label': 'Não',
            'bind': 'data-nao-req',
            'classType': 'btn btn-primary btn-block',
            'autoClose': true
        }]
    }, function (err, data) {
        if (err) {
            // do error handling
        } else {
            // do something with data
        }
    });

    $("button[data-sim-req]").on('click', function () {
        const deleteAPI = new Ged()
        const idDoc = $("#hd_cod_docs_exclui").val()
        deleteAPI.delete(idDoc)
        const dsTarefa = DatasetFactory.getDataset("dts_consultaTarefasMFX").values;
        criaTable(dsTarefa)
    });
}


function campoObrigatorio() {
    var campo_obr_preenchido = true;
    if (campo_obr_preenchido) {
        $('.cp_obrigatorio').each(function (e) {
            if ($(this).is(':visible')) {
                if (this.type == 'text') {
                    if (this.value.trim() == "") {
                        FLUIGC.toast({
                            title: 'Campo obrigatório vazio! <br>',
                            message: 'Campo ' + $('label[for="' + this.name + '"]').text() + ' está vazio',
                            type: 'danger'
                        });
                        campo_obr_preenchido = false;
                        return false;
                    }
                }
            }
            else {
                if (this.value == '0' || this.value == '') {
                    FLUIGC.toast({
                        title: 'Campo obrigatório vazio! <br>',
                        message: 'Campo ' + $('label[for="' + this.name + '"]').text() + ' está vazio',
                        type: 'danger'
                    });
                    campo_obr_preenchido = false;
                    return false;
                }
            }
        })
    }
    if ($('#tbody_cadastraCategoria tr').length == 0) {
        FLUIGC.toast({
            title: 'Adicione uma linha <br>',
            message: 'Adicione uma nova linha para cadastrar nova categoria',
            type: 'danger'
        });
        campo_obr_preenchido = false
    }


    return campo_obr_preenchido;
}

function voltaCentral() {
    window.open(WCMAPI.getTenantURL() + '/wg-parametrosgerais-chamados', '_self')
}

var filterCat = []
var filterAtend = []

function addTask(){
    var numTask = $("#rw_formCadTask")[0].children.length +1
    var newTask = `
    <div class="row" id="rw_rowFormCad___${numTask}">
        <div class="col-md-12">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <a class="collapse-icon up" data-toggle="collapse" data-parent="#accordion" href="#collapse___${numTask}">
                        Tarefa #${numTask}
                        </a>
                    </h4>
                </div>
                <div id="collapse___${numTask}" class="panel-collapse collapse in">
                    <div class="panel-body">
                        <div class="row" id="rw_taskConfig___${numTask}">
                            <div class="col-md-6 form-group">
                                <label for="ztxt_formCadTask_category">Categoria</label>
                                <input type="text" id="ztxt_formCadTask_category___${numTask}" name="ztxt_formCadTask_category___${numTask}" class="form-control" onchange="getValue(this, ${numTask})">
                                <input type="hidden" id="hd_form_formCadTask_category___${numTask}" name="hd_formCadTask_category___${numTask}" />
                            </div>
                            <div class="col-md-6">
                                <label for="ztxt_formCadTask_typeTask">Tipo de Atendimento</label>
                                <input type="text" id="ztxt_formCadTask_typeTask___${numTask}" name="ztxt_formCadTask_typeTask___${numTask}" class="form-control" readonly onchange="getTipo(this, ${numTask})">
                                <input type="hidden" id="hd_formCadTask_typeTask___${numTask}" name="hd_formCadTask_typeTask___${numTask}" />
                            </div>
                        </div>
                        <div class="row" id="rw_taskForm___${numTask}">
                            <div class="col-md-6 form-group">
                                <label for="txt_formCadTask_taskName___${numTask}">Tarefa</label>
                                <input name="txt_formCadTask_taskName___${numTask}" id="txt_formCadTask_taskName___${numTask}" class="form-control" />
                            </div>
                            <div class="col-md-3 form-group">
                                <label for="txt_formCadTask_type___${numTask}">Tipo</label>
                                <select id="txt_formCadTask_type___${numTask}" class="form-control">
                                    <option value="1">Incidente</option>
                                    <option value="2">Melhoria</option>
                                    <option value="3">Requisição de Serviço</option>
                                </select>
                            </div>
                            <div class="col-md-3 form-group">
                                <label for="txt_formCadTask_sla___${numTask}">SLA</label>
                                <input name="txt_formCadTask_sla___${numTask}" id="txt_formCadTask_sla___${numTask}" type="text" class="form-control"/>
                            </div>
                        </div>
                        <div class="row">
                            <button id="btn-save" type="button" class="btn-salva" onclick="addDescTask(${numTask})">
                                Adicionar Descrição
                            </button>
                            <hr/>
                        </div>
                        <div class="row" id="rw_rowFormCadTask___${numTask}"></div>
                        <div class="row" style="text-align:center">
                            <!-- <button id="btn-save" type="button" class="btn-salva" onclick="saveTask(${numTask})">
                                Salvar
                                <i class="flaticon flaticon-download icon-sm" aria-hidden="true"></i>
                            </button> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `

    var dts_categoria = DatasetFactory.getDataset('dts_consultaCategoriaMFX', null, null, null).values
    
    var settings = {
        source : dts_categoria,
        displayKey : 'TXT_CATEGORIA',
        style: {
            autocompleteTagClass: 'tag-oba',
            tableSelectedLineClass: 'info'
        },
        table: {
            header: [{
                'title': 'ID Categoria',
                'dataorder': 'TXT_ID_CATEGORIA',
                'standard': true 
            },
            {
                'title': 'Categoria',
                'dataorder': 'TXT_CATEGORIA'
            }],
            renderContent: ['TXT_ID_CATEGORIA', 'TXT_CATEGORIA']
        }
    }

    $("#rw_formCadTask").append(newTask)

    var newFilter = FLUIGC.filter(`#ztxt_formCadTask_category___${numTask}`, settings)

    filterCat.push({
        id: `#ztxt_formCadTask_category___${numTask}`,
        filter: newFilter
    })
}

function getValue(element, numTask){

    if(element.value != ''){
        var existFilterCat = filterCat.findIndex(filter => filter.id == `#ztxt_formCadTask_category___${numTask}`)
            var idCat = filterCat[existFilterCat].filter.getSelectedItems()[0].TXT_ID_CATEGORIA

            $(`#hd_form_formCadTask_category___${numTask}`).val(idCat)
    }

    var constraint = DatasetFactory.createConstraint('IDCATEG', $(`#hd_form_formCadTask_category___${numTask}`).val() , $(`#hd_form_formCadTask_category___${numTask}`).val() , ConstraintType.MUST)
    var dts_atendimento = DatasetFactory.getDataset('dts_consultaTpAtendMFX', null, [constraint], null).values

    var settings = {
        source : dts_atendimento,
        displayKey : 'TXT_TIPO_ATENDIMENTO',
        style: {
            autocompleteTagClass: 'tag-oba',
            tableSelectedLineClass: 'info'
        },
        table: {
            header: [{
                'title': 'ID Atendimento',
                'dataorder': 'TXT_ID_TIPOATEND',
                'standard': true 
            },
            {
                'title': 'Atendimento',
                'dataorder': 'TXT_TIPO_ATENDIMENTO'
            }],
            renderContent: ['TXT_ID_TIPOATEND', 'TXT_TIPO_ATENDIMENTO']
        }
    }

    var existFilter = filterAtend.findIndex(filter => filter.id == `#ztxt_formCadTask_typeTask___${numTask}`)

        if(element.value != ''){

            if(existFilter != -1){
                return filterAtend[existFilter].filter.reload(settings)
            }

            var newFilter = {
                id: `#ztxt_formCadTask_typeTask___${numTask}`,
                filter: FLUIGC.filter(`#ztxt_formCadTask_typeTask___${numTask}`, settings)
            }
             
            return filterAtend.push(newFilter)
          }
   return filterAtend[existFilter].filter.removeAll()
}

function getTipo(element, numTask){
    if(element.value != ''){
        var idType = element.id

        var indiceTipo = filterAtend.findIndex(filter => filter.id == `#${idType}`)
    
        var typeSelected = filterAtend[indiceTipo].filter.getSelectedItems()[0].TXT_ID_TIPOATEND
        $(`#hd_formCadTask_typeTask___${numTask}`).val(typeSelected)
    }
    
}

function addDesc(value){
    var newRow = $(`#tab_cadastraDescricao___${value}`)[0].children.length +1
    console.log('Chamando Função: ', value)
    var row = `
        <div id="rw_tabCadDesc___${value}___${newRow}" name="rw_tabCadDesc___${value}___${newRow}" class="row">
            <div class="col-md-5">
                <label for="">Descrição</label>
                <input type="text" id="txt_descName___${value}___${newRow}" name="txt_descName___${value}___${newRow}" />
            </div>
        </div>
    `
    $(`#tab_cadastraDescricao___${value}`).append(row)
}


function addDescTask(numTask){

    console.log('Função Chamada: ',numTask)

    var taskNumber = $(`#rw_rowFormCadTask___${numTask}`)[0].children.length +1

    var descTask = `
    <div class="row">
        <div class="col-md-2 form-group">
            <label for="txt_rowFormCadTask_numberTask___${numTask}___${taskNumber}">Número</label>
            <input type="text" id="txt_rowFormCadTask_numberTask___${numTask}___${taskNumber}" value="${taskNumber}" name="txt_rowFormCadTask_numberTask___${taskNumber}" class="form-control" readonly style="text-align: center">
        </div>
        <div class="col-md-8 form-group">
            <label for="txt_rowFormCadTask_questionTask___${numTask}___${taskNumber}">Descreva um questionamento necessário na solicitação deste serviço</label>
            <input type="text" id="txt_rowFormCadTask_questionTask___${numTask}___${taskNumber}" name="txt_rowFormCadTask_questionTask___${taskNumber}" class="form-control question">
        </div>

        <div class="col-md-2 form-group">
            <i class="flaticon flaticon-trash icon-lg btn_delete_serv" aria-hidden="true" onclick="deletTask(this)"></i>
        </div>
    </div>
    `

    $(`#rw_rowFormCadTask___${numTask}`).append(descTask)
}

function deletTask(element){
    var row = element.closest(".row")

    if(row){
        row.remove()
    }
}

function taskData(numTask){

    var valid = $(`#hd_form_formCadTask_category___${numTask}`).val()
    if(valid == ''){
        return FLUIGC.toast({
                        title: 'Erro: <br>',
                        message: `Verifique os campos da tarefa ${numTask}`,
                        type: 'info'
                    });
    }
    var element = $(`#rw_taskForm___${numTask}`)[0]
    dataForm =
    [ // lista dos campos 
        {
            "name"  : "txt_id_categoria",
            "value" : $(`#hd_form_formCadTask_category___${numTask}`).val() // CERTO
        }, 
        {
            "name"  : "hd_nome_categ",
            "value" : $(`#rw_taskConfig___1`)[0].querySelectorAll('input')[0].value // CERTO
        },
        {
            "name"  : "txt_id_tipoAtend",
            "value" : $(`#hd_formCadTask_typeTask___${numTask}`).val() // CERTO
        },
        {
            "name"  : "hd_nome_tpAtend",
            "value" : $(`#rw_taskConfig___1`)[0].querySelectorAll('input')[5].value
        },
        {
            "name"  : "txt_tarefa",
            "value" : $(`#txt_formCadTask_taskName___${numTask}`).val()
        },
        {
            "name"  : "sl_tarefa_tiposolic",
            "value" : element.querySelector('select').value
        },
        {
            "name"  : "txt_tarefa_slaSolic",
            "value" : $(`#txt_formCadTask_sla___${numTask}`).val()
        }
    ]

    var questions = $(`#rw_rowFormCadTask___${numTask}`).find(".question")
    for(i = 0 ; i < questions.length ; i++){
        dataForm.push({
            "name": `txt_descricao___${i+1}`,
            "value": questions[i].value
        })
    }

    var paramsRequest = {
      "parentDocumentId": 1767532,
      "version": 1000,
      "inheritSecurity": true,
      "formData": dataForm
    }
    return paramsRequest
}

function saveTask(numTask) {
    return new Promise((resolve, reject) => {
        var element = $(`#rw_taskForm___${numTask}`)[0];
        if (element) {
            console.log(taskData(numTask));

            var dataReq = JSON.stringify(taskData(numTask));

            $.ajax({
                url: '/api/public/2.0/cards/create',
                type: "POST",
                contentType: "application/json",
                Accept: "text/html",
                data: dataReq,
                success: function (data) {
                    $('#loading-oba').show();
                    FLUIGC.toast({
                        title: 'Cadastro de Categoria: <br>',
                        message: 'Realizado com sucesso',
                        type: 'success'
                    });
                    $('#loading-oba').hide();
                    resolve(); // Resolve a promise quando a requisição for bem-sucedida
                },
                error: function (data, errorThrown, status) {
                    console.log('Deu erro!');
                    reject(); // Rejeita a promise em caso de erro
                }
            });
        } else {
            resolve(); // Resolve a promise caso não haja elemento
        }
    });
}

async function salvarTasks() {
    var taskQtd = $("#rw_formCadTask")[0].children.length;

    for (let i = 0; i < taskQtd; i++) {
        await saveTask(i + 1);
    }
}