
// src: https://github.com/tc39/proposal-object-getownpropertydescriptors
// NOTE: uses Object.getOwnPropertyDescriptors reference implementation to polyfill



(function( globalNamespace ){
    'use strict';

    const Object = globalNamespace.Object;

    // Step 1: polyfilling dependencies
    if (typeof globalNamespace.Reflect === 'undefined') {
        globalNamespace.Reflect = {
            defineProperty: Object.defineProperty,
            getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
            ownKeys: function ownKeys(genericObject) {
                const gOPS = Object.getOwnPropertySymbols
                             || function getOwnPropertySymbols(){ return []; };
                return Object.getOwnPropertyNames(genericObject)
                    .concat(gOPS(genericObject));
            }
        };
    }

    if( !Object.hasOwnProperty( 'getOwnPropertyDescriptors' ) ){
        Object.defineProperty( Object, 'getOwnPropertyDescriptors', {
            configurable: true,
            writable: true,
            value: function getOwnPropertyDescriptors(genericObject) {
                // Let `obj` be ? `ToObject(O)`
                if (Object(genericObject) !== genericObject) {
                    throw new Error('Argument should be an object');
                }

                // Let `ownKeys` be the result of calling ? `obj.[[OwnPropertyKeys]]()`
                let ownKeys;
                try {
                    ownKeys = Reflect.ownKeys(genericObject);
                } catch(e) {
                    throw new Error('Unable to retrieve own keys');
                }

                // Let `descriptors` be ? `ObjectCreate(%ObjectPrototype%)`
                let descriptors;
                try {
                    descriptors = Object.create(Object.prototype);
                } catch(e) {
                    throw new Error('Unable to create an instance of Object.prototype');
                }

                for (let key of ownKeys) {

                    // Let `desc` be the result of ? `obj.[[GetOwnProperty]](key)`
                    // Let `descriptor` be ? `FromPropertyDescriptor(desc)`
                    let descriptor = Reflect.getOwnPropertyDescriptor(genericObject, key);

                    if (typeof descriptor !== 'undefined') {
                        // Let `status` be the result of ? `CreateDataProperty(descriptors, key, descriptor)`
                        try {
                            Reflect.defineProperty(descriptors, key, {
                                configurable: true,
                                enumerable: true,
                                writable: true,
                                value: descriptor
                            });
                        } catch(e) {
                            throw new Error('Unable to create a data property');
                        }
                    }
                }

                // Return `descriptors`
                return descriptors;
            }
        });
    }

    // Step 2: adding Object.compose, to fix Object.assign (which does not copy setters & getters)
    if( !Object.hasOwnProperty( 'compose' ) ){
        Object.compose = function compose(target, ...sources) {
            sources.forEach(( source  )=>{
                let descriptors = Object.keys(source).reduce(( descriptors, key )=>{
                    descriptors[ key ] = Object.getOwnPropertyDescriptor(source, key);
                    return descriptors;
                }, {});
                // by default, Object.assign copies enumerable Symbols too
                // so grab and filter Symbols as well
                Object.getOwnPropertySymbols(source).forEach(( sym )=>{
                    let descriptor = Object.getOwnPropertyDescriptor(source, sym);
                    if (descriptor.enumerable) {
                        descriptors[ sym ] = descriptor;
                    }
                });
                Object.defineProperties(target, descriptors);
            });
            return target;
        };
    }

}( ( typeof window !== 'undefined' ) ? window : global ));
