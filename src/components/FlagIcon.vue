<template>
    <v-tooltip 
        v-if="currentCountry"
        location="top"
        :text="currentCountry.name">
        <template v-slot:activator="{ props }">                          
            <span v-bind="props" :class="'fp '+ currentCountry.a2.toLowerCase()"></span>
        </template>    
    </v-tooltip>
</template>

<script>

import CountryCodes from 'country-code-info'

export default {
    props: {
        countryIdentifier: {
            type: String,
        },
    },
    setup( props ){
        const currentCountry = CountryCodes.findCountry({'a2': props.countryIdentifier});

        return {
            currentCountry,
        }
    },
}
    
</script>

