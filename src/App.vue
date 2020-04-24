<template lang="html">
  <div id="Antarus">

    <header>
      <div class="container">
        <img src="/img/Antarus.svg" alt="Antarus" id="Logotype">
      </div>
    </header>

    <main>
      <div v-for="(slide, slide_index) in view.slides" :key="slide_index" class="slide active">
        <div class="container">
          <h1>{{slide.header}}</h1>
          <div class="row">
            <div v-for="(column, col_index) in slide.columns" :key="col_index" :class="column.class">
              <template v-for="element in column.elements">
                <multibutton v-if="element.button" :model="elementsList[element.button.id]" :view="element.button" :result="result[elementsList[element.button.id].change]" :key="element.button.id" @clicked="buttonClick"></multibutton>
                <div v-if="element.div" :key="element.div.class" :class="element.div.class" v-html="element.div.content"></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script>
  import config from './data/config.json';
  import layout from './data/layout.json';
  // Компоненты
  import multibutton from './components/multibutton.vue';

  export default {
    name: 'app',
    components:{
      multibutton
    },
    data(){
      return {
        model: config.model,
        view: layout.view,
        result: {}
      }
    },
    computed: {
      elementsList(){
        var variants = {};
        // Перебираем все названия полей исходящих данных
        for (var result_name in this.model){
          // Запоминаем принцип записи в данное поле
          for (var role in this.model[result_name]) {
            // Если варианты поля — кнопки
            if (Array.isArray(this.model[result_name][role])){
              // для каждого варианта
              this.model[result_name][role].forEach(variant => {
                // привязываем к id его роль, значение, название поля исходящих данных и условие отображения (если есть)
                var variantProperties = {"role": role, "value": variant.value, "change": result_name};
                if (variant.condition) Object.assign(variantProperties, {"condition": variant.condition});
                Object.assign(variants, {[variant.id]: variantProperties})
              });
            // Если варианты поля — поля и переключатели
            }

          }
        }
        return variants
      }
    },
    methods: {
      buttonClick(result_name, value, role){
        switch (role) {
          case "radiobutton":
            this.$set(this.result,result_name,value);
            break;
          default:

        }
      }
    }
  }
</script>
