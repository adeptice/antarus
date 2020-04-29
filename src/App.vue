<template lang="html">
  <div id="Antarus">

    <header>
      <div class="container">
        <img src="/img/Antarus.svg" alt="Antarus" id="Logotype">
      </div>
    </header>

    <main>
      <div v-for="(slide, slide_index) in actualView.slides" :key="slide_index" class="slide" :class="{'active': slideClass(slide_index)}">
        <div class="container">
          <h1>{{slide.header}}</h1>
          <div class="row">
            <div v-for="(column, col_index) in slide.columns" :key="col_index" :class="column.class">

              <template v-for="element in column.elements">
                <multibutton v-if="element.button" :model="idList[element.button.id]" :view="element.button" :result="result[idList[element.button.id].change]" :key="element.button.id" @clicked="saveResult"></multibutton>
                <div v-if="element.div" :key="element.div.class" :class="element.div.class" v-html="element.div.content"></div>
              </template>

              <div v-for="form in column.forms" :key="form.header" class="form">
                <h2>{{form.header}}</h2>
                <inputline v-for="field in form.fields" :key="field.id" :model="idList[field.id]" :view="field" @filled="saveResult"></inputline>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>

    <navigation :slides="menuList" :current="current_slide" :next="nextButton" @slide="gotoSlide"></navigation>

  </div>
</template>

<script>
  import config from './data/config.json';
  import layout from './data/layout.json';
  // Компоненты
  import navigation from './components/navigation.vue';
  import multibutton from './components/multibutton.vue';
  import inputline from './components/inputline.vue';

  export default {
    name: 'app',
    components:{
      multibutton, inputline, navigation
    },
    data(){
      return {
        model: config.model,
        view: layout.view,
        result: {},
        current_slide: 0
      }
    },
    computed: {
      menuList(){
        var slideList = [];
        this.view.slides.forEach( slide => { slideList.push(slide.menu_name) });
        return slideList
      },
      nextButton(){
        var $cur_slide = this.view.slides[this.current_slide],
            isActive = true,
            nextText = "Следующий шаг";

        if ($cur_slide && $cur_slide.next_condition) {
          $cur_slide.next_condition.forEach( condition => {
            if ((!this.result[condition])||(this.result[condition].toString().length === 0)) isActive = false;
          });
          nextText = $cur_slide.next_name;
        }
        return ({"name": nextText, "isActive": isActive })
      },
      idList(){
        var variants = {};
        // Перебираем все названия полей исходящих данных
        for (var result_name in this.model){
          // Запоминаем принцип записи в данное поле
          for (var role in this.model[result_name]) {
            // Если варианты поля — кнопки
            if (Array.isArray(this.model[result_name][role])){
              // для каждого варианта
              this.model[result_name][role].forEach( variant => {
                // привязываем к id его роль, значение, название поля исходящих данных и условие отображения (если есть)
                var variantProperties = {"role": role, "value": variant.value, "change": result_name};
                if (Object.prototype.hasOwnProperty.call(variant, "condition")) Object.assign(variantProperties, {"condition": variant.condition});
                Object.assign(variants, {[variant.id]: variantProperties})
              });
            // Если варианты поля — поля и переключатели
            } else {
              var variant = this.model[result_name][role];
              var inputProperties = {"role": role, "label": variant.label, "change": result_name};
              if (Object.prototype.hasOwnProperty.call(variant, "required"))  Object.assign(inputProperties, {"required": true});
              if (Object.prototype.hasOwnProperty.call(variant, "condition")) Object.assign(inputProperties, {"condition": variant.condition});
              Object.assign(variants, {[variant.id]: inputProperties})
            }
          }
        }
        return variants
      },
      actualView(){
        return this.activeObjects(this.view)
      },
      valueResult(){
        var newResult = {}
        for (var outVar in this.result){
          if (Array.isArray(this.result[outVar])){
            var newValues=[];
            this.result[outVar].forEach(result => {
              if (this.idList[result]) {
                newValues.push(this.idList[result].value);
              } else {
                newValues.push(result);
              }
            });
            Object.assign(newResult,{[outVar]: newValues});
          } else {
            if (this.idList[this.result[outVar]]) {
              Object.assign(newResult,{[outVar]: this.idList[this.result[outVar]].value})
            } else {
              Object.assign(newResult,{[outVar]: this.result[outVar]})
            }
          }
        }
        return newResult
      }
    },
    methods: {
      activeObjects(property){
        if (typeof property === "object"){
          if (Array.isArray(property)) {
            var layerArray = []
            property.forEach( child => {
              var answer = this.activeObjects(child);
              if ((answer.id)&&(!this.isIdActive(answer.id))) { this.deleteResultById(answer.id); return false}
              if ((answer.link_id)&&(!this.isIdActive(answer.link_id))) return false;
              if (answer != false) layerArray.push(answer);
            });
            if (layerArray.length > 0) return layerArray;
            return false
          } else {
            var layerObject = {};
            for (var key in property){
              var answer = this.activeObjects(property[key]);
              if ((answer.id)&&(!this.isIdActive(answer.id))) { this.deleteResultById(answer.id); return false}
              if ((answer.link_id)&&(!this.isIdActive(answer.link_id))) return false;
              Object.assign(layerObject, {[key]: answer});
            }
            if ((layerObject.elements === false)||(layerObject.fields === false)) return false;
            return layerObject
          }
        } else { return property }
      },
      deleteResultById(id){

        for (var outVar in this.result){
          if (Array.isArray(this.result[outVar])){
            this.result[outVar].forEach((result, index) => {
              if (id === result) this.$delete(this.result[outVar], index);
            });
          } else {
            if (id === this.result[outVar]) this.$delete(this.result, outVar);
          }
        }
      },
      isIdActive(id){
        var isActive = true;
        if (this.idList[id].condition) {
          this.idList[id].condition.forEach( condition => {
            var outVar = Object.keys(condition)[0],
                isFound = false;
            if (this.valueResult[outVar]){
              if (Array.isArray(this.valueResult[outVar])){
                if (this.valueResult[outVar].indexOf(condition[outVar]) > -1) isFound = true;
              } else {
                isFound = (this.valueResult[outVar] == condition[outVar]);
              }
              if (!isFound) isActive = false;
            }
          })
        }
        return isActive
      },
      slideClass(index){ return (index === this.current_slide) },
      saveResult(result_name, value, role){
        if (role === "checkbox"){
          if (Object.prototype.hasOwnProperty.call(this.result, result_name)){
            var index = this.result[result_name].indexOf(value);
            if (index > -1) {
              this.$delete(this.result[result_name], index)
            } else {
              this.$set(this.result[result_name], this.result[result_name].length, value);
            }
          } else { this.$set(this.result, result_name, [value]) }
        } else {
          if ( (value === null) && (Object.prototype.hasOwnProperty.call(this.result, result_name)) ) {
            this.$delete(this.result, result_name)
          } else {
            this.$set(this.result, result_name, value)
          }
        }
      },
      gotoSlide(num) {
        this.current_slide = num;
      }
    }
  }
</script>
