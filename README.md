# "the world exploded and all we have left is yikyak :sweat_smile:"

## what's good

* [React components as ES6 classes](src/loot/table.jsx). You can do this
  ~\*today\*~ (with babel)
* [Flux](https://facebook.github.io/flux/) without a library? :anguished:
  * Components (like [the AppRoute](src/components/approute.jsx) and
    [ConnectivityTimer](src/components/connectivitytimer.jsx)) emit Actions
  * Stores (like [LootStore](src/stores/loot.js)) subscribe to Actions,
    listening for "create" events (and potentially "update", "delete")
  * Actions are limited to the subset of event names defined in `this.actions[]`
    (defined on the [parent](src/actions/loot.js)
    [classes](src/actions/connectivity.js))
  * No Dispatcher — traditional Flux requires an event bus, but it's (in my
    opinion) superfluous as you can subscribe to the Action classes themselves.
  * [Stores and Actions inherit from EventEmitter](src/flux.js).
    They emit events. It makes sense.
* The world's [most basic implementation](src/routes.jsx) of react-router.

## what's not

* the "database" is really an array on the server that goes away when you restart
* The front-end sucks. It was gunna be a map that follows you as you walk.
* it also doesn't sync properly, duplicating records. shortcuts take longer than
  you'd think, kids!
  * started plugging in mongodb, until...
* I started working on a turn-based pong clone instead, and got caught up in
  conversations about diversity and working groups and nodeboats and just good
  campjs stuff. sorry (not sorry)

## the rest

aim:
  authenticated, public messaging. annotate "stuff". "zombies here" that kind of shit

visual representation:
  - you're at the center, north is up.
  - time is slidable (default T-0s)
  - events are smaller the more in the past they are
    events are faded when they're in the future (very quickly, looking into the
    past)
  - event heatmap shown on time slider

pseudonymous, authenticated:
  - client generates private/public keys on init
  - everything's signed, public key is passed along with your encrypted mesasge
  - not at all private, but it's definitely /that guy/
  - future scope: potential for secret messages. maybe. i'm not a cryptographer

- pseudonymous, client generates a key to sign all messages?
  -> fuck usernames
  -> fuck the lot really

- can send any kind of message
  -> everything encodes into ascii eventually


# implementation

Map:
  some d3 thing, points around the place, idk its not important;

Store:
  Alt, localStorage
  { _id: false }

Sync:

* Sync straight to MongoDB - lol HTTP api

* GET
  -> send array of known _ids for filtering (save bandwidth)
  -> returns array of other JSON objects

* PUT
  -> send array of all our known objects with `_id: false`


Message structure:
Encrypted with the user's private key using [Cryptico](https://github.com/jpfox/cryptico)

    {
      type: 'text'        mime type of the payload
      pubkey: <>          user's public key, also kind of an identifier
      payload: <>         the message, encrypted
      latlng: [lat, lng]  location of the message
      signature:          unencrypted payload + type + latlng, encrypted (for validation)
    }


# future scope

24.7 the wild

-> record arbitrary events
-> view them on the wide scale, by time.

# Licence

Triple licenced under WTFPL, beerware, and into the public domain. Do whatever
you want with this, I hope it helps and delights you!
