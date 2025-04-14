<template>
    <v-autocomplete
        v-model="model"
        :menu-props="{ scrollStrategy: 'close'}"
        :items="countries"
        item-title="name"
        item-value="a2"
        label="Player Country"
        >
        <template v-slot:selection="{ item }">
            <span style="margin-right: 5px">               
                <FlagIcon :countryIdentifier="item.raw.a2" />
            </span>
            {{ item.raw.name }}                      
        </template>
        <template v-slot:item="{ props: props, item }">
        <v-list-item
            v-bind="props"
            :title="item.raw.name">  
            <template v-slot:prepend>                
                <span style="margin-right: 5px">    
                    <FlagIcon :countryIdentifier="item.raw.a2" />
                </span>
            </template>                         
        </v-list-item>
        </template>
    </v-autocomplete>
</template>

<script>
import { defineModel } from 'vue'
import countries from 'country-code-info/data/countries.json'

export default {
    setup(){
        const model = defineModel()
        return {
            model,
            countries,
        }
    },
}

</script>