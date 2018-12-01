import { h, Component } from 'preact';
import { Router, route } from 'preact-router';

import Header from './header';

import Login from '../routes/login';
import Movies from '../routes/movies';
import Search from '../routes/search';

import NotFound from '../routes/404';

import { auth, provider, database } from '../firebase';

export default class App extends Component {
  state = {
    currentUrl: '',
    user: null,
    movies: []
  }

  handleRoute = e => {
    switch (e.url) {
      case '/':
      case '/search':
        // TODO: notify user they need to login to do that
        if (!this.state.user) {
          route('/login', true);
          this.setState({ currentUrl: '/login' });
          return;
        }
        break;
      case '/login':
        // TODO: notify user they are already logged in
        if (this.state.user) {
          route('/', true);
          this.setState({ currentUrl: '/' });
          return;
        }
        break;
      default:
        break;
    }

    this.setState({
      currentUrl: e.url
    });
  };

  login = async () => {
    try {
      const { user } = await auth.signInWithPopup(provider);
      this.setState({ user });
    } catch (error) {
      // TODO: Notify the user of error
      console.error('An error has occurred while authenticating:', error);
    }
  };

  logout = async () => {
    await auth.signOut();
    this.setState({ user: null });
    route('/login');
  };

  componentDidMount() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.moviesRef = database.ref('/movies/' + user.uid);

        // Get movies initially and on updates
        // then store in state
        this.moviesRef.on('value', snapshot => {
          const movies = snapshot.val();
          this.setState({
            movies: Object.keys(movies)
              // Get all of the movies and store their `id`
              .map(key => ({
                ...movies[key],
                id: key
              }))
              // Sort the movies by their names
              .sort((a, b) => a.movieName.localeCompare(b.movieName))
          });
        });

        // Set user then go to home
        this.setState({
          user
        }, () =>
          this.currentUrl !== '/' && route('/')
        );
      }
    });
  }

  render() {
    return (
      <div id="app">
        <Header onLogout={this.logout} user={this.state.user} selectedRoute={this.state.currentUrl} />
        <Router onChange={this.handleRoute}>
          <Login onLogin={this.login} path="/login" />
          <Movies path="/" user={this.state.user} movies={this.state.movies} />
          <Search path="/search" user={this.state.user} />
          <NotFound default />
        </Router>
      </div>
    );
  }
}
