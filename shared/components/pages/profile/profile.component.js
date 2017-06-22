/* global module document FormData File */

import React from 'react';
import { Map, List } from 'immutable';
import Panel from 'shared/lib/base_classes/panel';
import { uploadImage, updateUser, updateCalculatorGoal } from 'api/competition.api';
import profileContainer, { profilePropTypes } from 'shared/containers/profile.container';
import template from './profile.rt.html';

const SOCIAL_MEDIA_PLATFORMS = [
  'facebook', 'twitter', 'instagram', 'linkedin', 'medium',
];

class ProfileComponent extends Panel {

  constructor(props, context) {
    super(props, context);
    const profile = this;
    profile.state = {
      uploaded_photo_src: '',
      file_selected: false,
      profile_edit_active: false,
      remote_profile_loaded: false,
      is_loading: false,
    };
  }

  componentDidMount() {
    const token = this.props.auth.getIn(['data', 'token']);
    this.props.retrieveProfile({ user_id: this.user_id, token });
  }

  componentDidUpdate() {
    if (this.loaded && !this.state.remote_profile_loaded) this.checkRemoteProfileData();
  }

  render() {
    return template.call(this);
  }

  get user_id() {
    return parseInt(this.props.location.getIn(['params', 'user_id']), 10);
  }

  get loaded() {
    return !this.props.profile.get('loading') && !this.error;
  }

  get error() {
    return this.props.profile.get('load_error');
  }

  get user_profile() {
    return this.props.profile.get('data');
  }

  get full_name() {
    return `${this.user_profile.get('firstName')} ${this.user_profile.get('lastName')}`;
  }

  get photo_is_set() {
    return this.photo_url ? this.photo_url.length > 2 : false;
  }

  get photo_url() {
    return this.state.uploaded_photo_src ? this.state.uploaded_photo_src : this.user_profile.get('imageUrl');
  }

  get location() {
    return `${this.user_profile.getIn(['location', 'city'])}, ${this.user_profile.getIn(['location', 'county'])}, ${this.user_profile.getIn(['location', 'state'])}`;
  }

  get social_media_platforms() {
    return SOCIAL_MEDIA_PLATFORMS;
  }

  get introduction() {
    return this.user_profile.get('introduction');
  }

  get profile_data() {
    return this.user_profile.get('socialMedia');
  }

  get user_goals() {
    if (this.user_profile.has('calculatorGoals') && List.isList(this.user_profile.get('calculatorGoals'))) {
      let user_goals = this.user_profile.get('calculatorGoals').toJS();
      user_goals = user_goals.filter(key => key.status !== 'not_relevant');
      return user_goals.sort((a, b) => {
        if (a.status === 'completed') {
          return -1;
        }
        if (b.status === 'completed') {
          return 1;
        }
        return 0;
      });
    }
    return 0;
  }

  get is_public() {
    return this.state.privacy_changed ? this.state.publicProfile : this.user_profile.get('publicProfile');
  }

  get show_upload_hover() {
    return this.state.file_selected;
  }

  get is_loading() {
    return this.state.is_loading;
  }

  get is_own_editable_profile() {
    return this.user_authenticated && (this.user_profile.get('userId') === this.props.auth.getIn(['data', 'user_id']));
  }

  get profile_footprint() {
    if (this.loaded) {
      try {
        return JSON.parse(this.user_profile.get('totalFootprint'));
      } catch (e) {
        return {};
      }
    } else {
      return {};
    }
  }

  checkRemoteProfileData() {
    if (this.profile_data && Map.isMap(this.profile_data)) {
      const profile_data = Object.assign({}, this.profile_data.toJS(), {
        remote_profile_loaded: true,
      });
      this.setState(profile_data);
    }
  }

  getProfileData(type) {
    return this.state[type] === undefined ? this.state[type] : this.state[type].replace(this.getProfilePrefix(type), '');
  }

  getProfileLink(type) {
    return this.state[type];
  }

  getProfilePrefix(type) {
    switch (type) {
      case 'facebook':
        return 'https://facebook.com/';
      case 'twitter':
        return 'https://twitter.com/';
      case 'instagram':
        return 'https://instagram.com/';
      case 'linkedin':
        return 'https://linkedin.com/';
      case 'medium':
        return 'https://medium.com/';
      default:
        break;
    }
    return '';
  }

  selectedFile() {
    this.setState({
      file_selected: true,
    });
  }

  triggerEdit() {
    this.setState({
      profile_edit_active: true,
    });
  }

  updateInput(event) {
    const key = event.target.dataset.key;
    const value = this.social_media_platforms.includes(key) ? `${this.getProfilePrefix(key)}${event.target.value}` : event.target.value;
    this.setState({
      [key]: value,
    });
  }

  viewRanking() {
    const profile = this;
    const ui = {
      id: 'show_leaders_chart',
      data: true,
    };

    profile.props.updateUI(ui);
    profile.router.goToRouteByName('Footprint');
  }

  displayActionTitle(key) {
    return this.t(`actions.${key}.label`);
  }

  displayActionStatus(status) {
    if (status === 'already_done') return 'already done';
    return status;
  }

  actionIsCompleteOrDone(action) {
    return action.status === 'completed' || action.status === 'already_done';
  }

  getCategoryIcon(key) {
    const category = this.getCategoryByAction(key);
    if (category === 'transportation') {
      return 'bicycle';
    } else if (category === 'housing') {
      return 'home';
    }
    return 'cutlery';
  }

  displayActionDollarsSaved(dollars_saved) {
    return this.numberWithCommas(dollars_saved);
  }

  displayActionUpfrontCost(upfront_cost) {
    return this.numberWithCommas(upfront_cost);
  }

  toggleActionComplete(action) {
    const updated_status = action.status === 'completed' ? 'pledged' : 'completed';
    const update = {
      calculatorKey: action.calculatorKey,
      status: updated_status,
      savings: action.savings,
    };
    this.updateRemoteUserActions(update);
  }

  updateRemoteUserActions(update) {
    if (this.user_authenticated) {
      const token = this.props.auth.getIn(['data', 'token']);
      updateCalculatorGoal(update, token).then(() => {
        this.props.retrieveProfile({ user_id: this.user_id, token });
      });
    }
  }

  uploadPhoto(event) {
    event.preventDefault();
    const profile = this;
    const files = document.getElementById('user-photo-upload').files;
    const formData = new FormData();

    if (files.length > 0) {
      if (files[0] instanceof File) {
        profile.setState({
          is_loading: true,
        });
        formData.append('image', files[0]);
        const token = profile.props.auth.getIn(['data', 'token']);
        uploadImage(formData, token).then((res) => {
          const imageUrl = res[0];
          updateUser({ imageUrl }, token).then(() => {
            profile.setState({
              file_selected: false,
              is_loading: false,
            });
            this.props.retrieveProfile({ user_id: this.user_id, token });
          });
        });
      }
    }
  }

  updatePrivacy() {
    const token = this.props.auth.getIn(['data', 'token']);
    const is_public = this.state.privacy_changed ? !this.state.publicProfile : !this.user_profile.get('publicProfile');

    this.setState({
      publicProfile: !this.state.publicProfile,
      privacy_changed: true,
    });

    updateUser({ publicProfile: is_public.toString() }, token);
  }

  updateProfile() {
    const profile = this;
    const token = profile.props.auth.getIn(['data', 'token']);
    const socialMedia = {};

    profile.social_media_platforms.forEach((p) => {
      const url = profile.state[p];
      if (url && url.length > 0) {
        socialMedia[p] = url;
      }
    });

    const update = { socialMedia };
    if ({}.hasOwnProperty.call(profile.state, 'intro') && profile.state.intro.length > 0) update.introduction = profile.state.intro;

    profile.setState({
      is_loading: true,
    });

    updateUser(update, token).then(() => {
      profile.setState({
        profile_edit_active: false,
        is_loading: false,
        privacy_changed: false,
      });
      profile.props.retrieveProfile({ user_id: this.user_id });
    });
  }

}

ProfileComponent.propTypes = profilePropTypes;
ProfileComponent.NAME = 'Profile';

module.exports = profileContainer(ProfileComponent);
