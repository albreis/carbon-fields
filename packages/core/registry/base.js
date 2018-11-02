/* eslint no-console: [ 'error', { allow: [ 'error' ] } ] */

/**
 * External dependencies.
 */
import {
	isString,
	isFunction,
	startCase
} from 'lodash';

/**
 * Internal dependencies.
 */
import withFilters from '../utils/with-filters';

/**
 * Creates a new registry.
 *
 * @param  {string}   domain
 * @param  {string[]} supportedContexts
 * @return {boolean}
 */
export function createRegistry( domain, supportedContexts ) {
	const domainStartCased = startCase( domain );

	/**
	 * Keeps track of registered types.
	 *
	 * @type {Object}
	 */
	const types = {};

	/**
	 * Keeps track of types that are already wrapped with `withFilters` helper.
	 *
	 * @type {Object}
	 */
	const enhancedTypes = {};

	/**
	 * Registers a new type.
	 *
	 * @param  {string} type
	 * @param  {Function} component
	 * @return {boolean}
	 */
	function registerType( type, component ) {
		if ( ! isString( type ) ) {
			console.error( `${ domainStartCased } type must be a string.` );
			return false;
		}

		if ( types[ type ] ) {
			console.error( `${ domainStartCased } ${ type } is already registered.` );
			return false;
		}

		if ( ! component || ! isFunction( component ) ) {
			console.error( 'The "component" param must be a function.' );
			return false;
		}

		types[ type ] = component;

		return true;
	}

	/**
	 * Returns a registered field type.
	 *
	 * @param  {string} type
	 * @param  {string} context
	 * @return {?Object}
	 */
	function getType( type, context ) {
		if ( ! supportedContexts.includes( context ) ) {
			console.error( `The provided context isn\'t a valid one. Must be one of - ${ supportedContexts.join( ', ' ) } .` );
			return;
		}

		if ( ! types[ type ] ) {
			console.error( `${ domainStartCased } ${ type } isn\'t registered.` );
			return;
		}

		if ( ! enhancedTypes[ type ] ) {
			enhancedTypes[ type ] = {};
		}

		if ( ! enhancedTypes[ type ][ context ] ) {
			enhancedTypes[ type ][ context ] = withFilters( `carbon-fields.${ type }-${ domain }.${ context }` )( types[ type ] );
		}

		return enhancedTypes[ type ][ context ];
	}

	return {
		[ `register${ domainStartCased }Type` ]: registerType,
		[ `get${ domainStartCased }Type` ]: getType
	};
}
