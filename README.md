Proposal: `Object.compose` (composed prototypal Inheritance)
==============================================================



It is known that `Object.assign` is 
[not suitable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Description)
for *Prototype Composition*. By design, which I had to learn the hard way. I tried to do this:

```javascript
import EventMachine from './libs/event-machine';


function RtcData( id ){
    const self = this;

    self._id = id;
    
    // ...

    EventMachine.call( self );
    
    // ...
}

// (!!!) NOTE: 'assign' does not work, the proposed 'compose' would
Object.assign( RtcData.prototype, EventMachine.prototype, {
   
    constructor: RtcData,
    
    get id(){
        const self = this;
        const prefix = 'fasel';
        return `${ prefix }-${ self._id }`;
    },
    
    send( /* args */ ){
        // this is a regular enumerable function
    },    
    ...
});



// the following log statements print 'undefined' or throw, instead of 'fasel-foobar', 
// because getter and setter methods won't get copied over by the 'assign' function

const rtData = new RtData( 'foobar' );
console.log( rtData.id ); 

rtData.on( 'someEvent', function( e ) {
    const rtDataContext = this;
    console.log( rtDataContext.id ); 
});
```

*(Note: this example code originates in [this](https://github.com/lucendio/meteor_rtc) project)*

[This behaviour is intended in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Description). 
During my research regarding this 'issue', I discovered the proposal for  
[`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors)
scheduled to be released in the 2017th version of ECMAScript. At the bottom of the `README.md` the 
author outlines an 
[example](https://github.com/tc39/proposal-object-getownpropertydescriptors#illustrative-examples)
which takes `Object.getOwnPropertyDescriptors` a step further and enables exactly the behaviour 
I was looking for - a 'fixed' version of `Object.assign`.



### Why?

+   all the behaviour of inheritance that got syntax-sugared by the introduction of `class` in *ES6* 
    can be accomplished in a composing and more transparent and explicit way with `Object.compose`
+   provides a fully working way of merging not only object instances but complete prototypes, 
    which, at the end of the day, is still what's powering `class`es under the hood.
    

 
### Implementation:

A working polyfill can be found [here](./polyfill_obejct.compose.js). Please note that I did *not* 
wrote this code, I just assembled it. The actual author is the one who proposed
[`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors).
