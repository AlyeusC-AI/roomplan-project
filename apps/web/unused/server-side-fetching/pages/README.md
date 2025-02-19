# What this is

This folder contains data fetching methods for _each page_.
The current solution to data fetching in next.js is that the page needs to know about all it's data requirements on render. With nested layouts this is fantastic because each boundary can fetch the apppropriate data, but without nested layouts (what we currently have as of writing this), it means for big queries like the ones you see in this folder.

## Considerations

- Not DRY
- Faster than original approach
- Hard to figure out data requirements from recoil atoms. Need to make this better
