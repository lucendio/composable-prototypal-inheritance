Proposal: `Object.compose` (composable prototypal Inheritance)
==============================================================



It is known that `Object.assign` is 
[not suitable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Description)
for *Object Composition*. By design, which I had to learn the hard way. I tried to do this:

```javascript
import EventMachine from './libs/event-machine';
import ReactiveStateMachine from './libs/reactive-state-machine';


function RtcData( id ){
    const self = this;

    self._id = id;
    
    // ...

    EventMachine.call( self );
    
    // ...
}

// (!!!) NOTE: 'assign' does not work, the proposed 'compose' would
Object.assign( RtcData.prototype, EventMachine.prototype, ReactiveStateMachine.prototype, {
   
    constructor: RtcData,
    
    get id(){
        const self = this;
        const prefix = 'fasel';
        return `${prefix}-${self._id}`;
    },
    
    send( /* args */ ){
        // this is a regular enumerable function
    },    
    ...
});



const rtData = new RtData('foobar');
console.log(rtData.id); // prints 'undefined' or throws, instead of 'foobar'

rtData.on('someEvent', function(e) {
    const rtDataContext = this;
    console.log(rtDataContext.id); // prints 'undefined' or throws, instead of 'foobar' 
});
```

Obviously it won't work. While searching for the root cause of this, I also found the proposal of 
[`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors)
for a future version of ECMAScript. At the bottom of the `README.md` the author outlines an 
[example](https://github.com/tc39/proposal-object-getownpropertydescriptors#illustrative-examples)
which takes `Object.getOwnPropertyDescriptors` a step further and enables exactly the behaviour 
I was looking for - a *fixed* version of `Object.assign`.



### Why?

+   all the behaviour of inheritance that got syntax-sugared by the introduction of `class` in *ES6* 
    can be accomplished in a composable and more transparent way with `Object.compose`
+   provides a fully working way of merging not only object instances but complete prototypes, 
    which, at the end of the day, is still what's powering `class`es under the hood.
    

 
### Implementation:

A working polyfill can be found [here](./polyfill_obejct.compose.js). Please note that I did *not* 
wrote this code, I just assembled it. The actual author is the one who proposed
[`Object.getOwnPropertyDescriptors`](https://github.com/tc39/proposal-object-getownpropertydescriptors).
