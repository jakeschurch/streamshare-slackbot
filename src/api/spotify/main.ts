import { MusicAPI, Track, TrackID, Artist, AlbumID, Album, APIResponse, APIResponseTransformer, ResponseLike, type MusicSearchParam } from '../base';

type SpotifyApiUrl =
  | `https://api.spotify.com/v1/tracks/${string}`
  | `https://api.spotify.com/v1/albums/${string}`
  | `https://api.spotify.com/v1/artists/${string}`
  | `https://api.spotify.com/v1/playlists/${string}`
  | `https://api.spotify.com/v1/search?q=${string}&type=${MusicSearchParam['type']}`;


class SpotifyApiResponseTransformer implements APIResponseTransformer {
  async fromType(response: ResponseLike, type: MusicSearchParam['type']): Promise<APIResponse> {
    switch (type) {
      case 'track':
        return await this.toTrack(response);

      case 'album':
        return await this.toAlbum(response);

      case 'artist':
        return await this.toArtist(response);
    }
  }

  async toAlbum(response: ResponseLike): Promise<Album> {
    if (!response) {
      throw new Error('Something went wrong')
    }

    const json = await response.json();
    return ({
      id: json.id,
      name: json.name
    });
  }

  async toTrack(response: ResponseLike): Promise<Track> {
    if (!response) {
      throw new Error('Something went wrong')
    }

    const json = await response.json();
    return ({
      id: json.id,
      name: json.name,
      uri: json.uri,
      artist: {
        id: json.artists[0].id,
        name: json.artists[0].name
      }
    });
  }

  async toArtist(response: ResponseLike): Promise<Artist> {
    if (!response) {
      throw new Error('Something went wrong')
    }

    const json = await response.json();
    return ({
      id: json.id,
      name: json.name
    });
  }
}

export class SpotifyAPI implements MusicAPI {
  apiResponseTransformer: SpotifyApiResponseTransformer

  trackRegex = new RegExp('https://open.spotify.com/track/(?<id>[a-zA-Z0-9]+)')
  albumRegex = new RegExp('https://open.spotify.com/album/(?<id>[a-zA-Z0-9]+)')
  artistRegex = new RegExp('https://open.spotify.com/artist/(?<id>[a-zA-Z0-9]+)')

  constructor() {
    this.apiResponseTransformer = new SpotifyApiResponseTransformer()
  }

  async search(param: MusicSearchParam): Promise<APIResponse> {
    const searchQueryParam = encodeURIComponent(`${param.type}:${param.query}`);

    return await this.get(`https://api.spotify.com/v1/search?q=${searchQueryParam}&type=${param.type}`).then(
      async response => this.apiResponseTransformer.fromType(response, param.type)
    );
  }

  async fromUrl(url: SpotifyApiUrl): Promise<APIResponse> {
    switch (true) {
      case this.trackRegex.test(url):
        return await this.getTrack(
          this.trackRegex.exec(url)!.groups!.id!
        );

      case this.albumRegex.test(url):
        return await this.getAlbum(
          this.albumRegex.exec(url)!.groups!.id!
        );

      case this.artistRegex.test(url):
        return await this.getArtist(
          this.artistRegex.exec(url)!.groups!.id!
        );

      default:
        throw new Error('Invalid url')
    }
  }

  async get(url: SpotifyApiUrl): Promise<Response> {
    const token = process.env.SPOTIFY_ACCESS_TOKEN

    if (!token) {
      throw new Error('No spotify API token')
    }

    return await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  async getAlbum(id: string): Promise<Album> {
    const url: SpotifyApiUrl = `https://api.spotify.com/v1/albums/${id}`
    return await this.get(url)
      .catch(e => console.error(e))
      .then(this.apiResponseTransformer.toAlbum)
  }

  async getArtist(id: string): Promise<Artist> {
    const url: SpotifyApiUrl = `https://api.spotify.com/v1/artists/${id}`
    return await this.get(url)
      .catch(e => console.error(e))
      .then(this.apiResponseTransformer.toArtist)
  }

  async getTrack(id: string): Promise<Track> {
    const url: SpotifyApiUrl = `https://api.spotify.com/v1/tracks/${id}`
    return await this.get(url)
      .catch(e => console.error(e))
      .then(this.apiResponseTransformer.toTrack)
  }
}
