
import React from 'react'
import ReactDOM from 'react-dom'

const remote = require('electron').remote;
const app = remote.app;
const path = require('path');
const shell = require('electron').shell;

export default class MovieDetails extends React.Component {

  constructor(props) {
    super(props);
    this.openFile = this.openFile.bind(this);
    this.openFolder = this.openFolder.bind(this);
    this.openIMDb = this.openIMDb.bind(this);
    this.playEpisode = this.playEpisode.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(Object.keys(this.props.movie).length != 0  &&  this.props.movie.imdbid != nextProps.movie.imdbid) {
      this.movie_backdrop.scrollTop = 0;
    }
  }

  playEpisode(fileName) {
    shell.openItem(fileName);
  }

  openFile(e) {
    shell.openItem(this.props.movie.fileName);
  }

  openFolder(e) {
    shell.showItemInFolder(this.props.movie.fileName);
  }

  openIMDb(e) {
    shell.openExternal("http://www.imdb.com/title/" + this.props.movie.imdbid);
  }

  movieProperty(p, type) {
    if(p != null) {    
      let tags = p.map(function(prop) {
        return (
          <div className={"movie-"+type} key={prop}>{prop}</div>
        );
      });

      return tags;
    } else {
      return null;
    }
  }

  render() {
    let t = this;
    // let isShown = (t.props.isShown) ? "movie-details" : "movie-details hide";
    let movie = t.props.movie;
    let episodes = [];

    if (Object.keys(movie).length === 0) return (<div></div>);

    if (movie.type == "series") {

      movie.episodes.forEach(function(episode) {
        if(episodes[episode.season]) {
          episodes[episode.season][episode.episode] = episode;
        } else {
          episodes[episode.season] = [];
          episodes[episode.season][episode.episode] = episode; 
        }
      });

    }

    var p = path.join(app.getPath('userData'), "backdrops", movie.backdrop_path);
    var bg = {
      backgroundImage: 'url("' + p + '")'
    };


    var movie_seasons = episodes.map(function(season) {
      let season_count = season.findIndex((e) => {return e});

      return (
        <div className="movie-season" key={"season" + season[season_count].season}>
          <div className="movie-season-title">Season {season[season_count].season}</div>
          <div className="movie-episodes">
          {season.map(function(episode) {
            return (
                <div className="movie-episode" key={"e" + episode.season + episode.episode}>
                  <img src={path.join(app.getPath('userData'), "stills", episode.still_path)} alt={episode.title} width="100%" />
                  <div className="movie-episode-actions">
                    <div className="movie-episode-play" onClick={() => t.playEpisode(episode.fileName)}></div>
                  <div className="movie-episode-number">{episode.episode}</div>
                  </div>
                </div>
            );
          })}
          </div>
        </div>
      );
    });

    return (
      <div className="movie-details">
        <div id="back" onClick={this.props.onBack}></div>
		    <div className="movie-backdrop" style={bg} ref={(m) => { this.movie_backdrop = m; }}>

          <div className="movie-overlay">

            <div className="movie-poster">

              <img src={path.join(app.getPath('userData'), "posters", movie.poster_path)} />
              <div className="movie-poster-actions">
                {movie.type == "movie" &&
                  <div className="movie-play" onClick={this.openFile}></div>
                }
              </div>

            </div>

            <div className="movie-information">
              <div className="movie-title">{movie.title} <span className="movie-year">({movie.year})</span></div>
              <div className="movie-rating-genres">
                <div className="movie-rating">{movie.imdbrating}</div>
                <div className="movie-genres">{ t.movieProperty(movie.genres, 'genre') }</div>
                <div className="movie-runtime">{movie.runtime} mins</div>
              </div>
              <div className="movie-plot">{movie.plot}</div>

              { (movie.actors != null) &&
                <div className="movie-actors">
                  <div className="movie-actors-title">Actors</div>
                  { t.movieProperty(movie.actors, 'actor') }
                </div>
              }

              { (movie.directors != null) &&
                <div className="movie-directors">
                  <div className="movie-directors-title">Directed by</div>
                  { t.movieProperty(movie.directors, 'director') }
                </div>
              }

              <div className="movie-actions">
                {movie.type == "movie" &&
                  <div className="movie-action open-folder" onClick={this.openFolder}></div>
                }
                <div className="movie-action open-imdb" onClick={this.openIMDb}></div>
              </div>
            </div>

          </div>
          {movie.type == "series" &&   
            <div className="movie-seasons-wrap">       
              <div className="movie-seasons">
                {movie_seasons}
              </div>
            </div>
          }

        </div>
		  </div>
    );
  }
}