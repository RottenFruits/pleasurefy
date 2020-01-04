# pleasurefy

pleasurefy is music visualizer application that inspired by Joy Division's music album.

This application is refering to many parts of fluuuid's [lines](https://github.com/fluuuid/labs/tree/master/lines) repository.

![demo](https://github.com/RottenFruits/pleasurefy/blob/master/gif/g1.gif?raw=true)

## Dependency
- Docker

## How to run
- clone
```
git clone https://github.com/RottenFruits/pleasurefy.git
cd pleasurefy
```

- build and server run
```
docker build -t pleasurefy .
docker run --rm -p 8090:8000 pleasurefy
```

- open browser
    - http://localhost:8090/

## todo

- select music
- start and stop
- change line width

## Music
- [Dusty Noise - Rotten Fruits](https://corecorecords.bandcamp.com/album/miscellaneous)

## References

- [lines](https://labs.fluuu.id/lines/)
