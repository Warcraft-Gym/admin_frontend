<template>
    <v-tooltip
        v-if="currentRace"
        location="top"
        :text="currentRace.name">
        <template v-slot:activator="{ props }"> 
            <v-avatar 
            v-bind="props" 
            :image="currentRace.icon"
            rounded="0" 
            size="x-small">
            </v-avatar>                                                   
        </template>
    </v-tooltip> 
</template>

<script>

import { raceWrapper } from '@/helpers/races.js'

export default {
    props: {
        raceIdentifier: {
            type: String,
        },
    },
    setup( props ){
        const currentRace = raceWrapper.getRaceObject( props.raceIdentifier );
        return {
            currentRace,
        }
    },
}
    
</script>

