export type Track = {
  id: TrackID;
  name: string;
  uri: string;
  artist: Artist;
}

export type Artist = {
  id: ArtistID;
  name: string;
}

export type Album = {
  id: AlbumID;
  name: string;
}

export type AlbumID = string

export type ArtistID = string

export type TrackID = string

export type APIResponse = Track | Artist | Album;

export type ResponseLike = Response | void;

export type MusicSearchParam = {
  type: "album" | "artist" | "track";
  query: string
};

export abstract class MusicAPI {
  trackRegex: RegExp
  albumRegex: RegExp
  artistRegex: RegExp

  apiResponseTransformer: APIResponseTransformer

  abstract search(param: MusicSearchParam): Promise<APIResponse>
  abstract fromUrl(url: string): Promise<APIResponse>
  abstract get(url: string): Promise<Response>
  abstract getTrack(trackID: TrackID): Promise<Track>
  abstract getArtist(artistID: ArtistID): Promise<Artist>
  abstract getAlbum(albumID: AlbumID): Promise<Album>
}

export abstract class APIResponseTransformer {
  abstract fromType(response: ResponseLike, type: MusicSearchParam['type']): PromiseLike<APIResponse>
  abstract toAlbum(response: ResponseLike): PromiseLike<Album>
  abstract toArtist(response: ResponseLike): PromiseLike<Artist>
  abstract toTrack(response: ResponseLike): PromiseLike<Track>
}
