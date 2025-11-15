<template>
    <v-autocomplete
        v-model="model"
        label="Race"
        :menu-props="{ scrollStrategy: 'close'}"
        item-title="name"
        item-value="id"
        :item-props="itemProps"
        :items="raceWrapper.races">
        <template v-slot:selection="{ item }">            
        <span>            
            <RaceIcon :raceIdentifier="item.raw.id" />
            {{ item.raw.name }}
        </span>     
        </template>
        <template v-slot:item="{ props: itemProps, item }">
        <v-list-item
            v-bind="itemProps"
            :title="item.raw.name">
            <template v-slot:prepend>
                <RaceIcon :raceIdentifier="item.raw.id" />
            </template>                         
        </v-list-item>
        </template>
    </v-autocomplete>
</template>

<script>

import { defineModel } from 'vue'
import { raceWrapper } from '@/helpers/races.js'

export default {
    setup(){
        const model = defineModel();
        
        return {
            model,
            raceWrapper,
        }
    },
}
    
</script>