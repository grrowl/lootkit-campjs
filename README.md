# "the world exploded and all we have left is yikyak :\"

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
