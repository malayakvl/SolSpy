<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            CREATE OR REPLACE FUNCTION data.search_validators(p_search_term text, p_filter_type text, p_user_id bigint, p_sort_column text, p_offset integer, p_limit integer, p_validator_ids bigint[] DEFAULT NULL::bigint[])
            RETURNS TABLE(id bigint, vote_pubkey character varying, node_pubkey character varying, name character varying, activated_stake bigint, commission double precision, epoch_credits jsonb, last_vote bigint, delinquent boolean, root_slot bigint, start_epoch bigint, url character varying, ip character varying, latitude double precision, longitude double precision, country character varying, city character varying, version character varying, superminority boolean, epoch_stats jsonb, epochs_count bigint, has_last_epoch_stats boolean, avg_uptime double precision, avg_apy double precision, details text, network character varying, asn character varying, jito boolean, jito_commission double precision, avatar_file_url character varying, software_client character varying, has_screenshot boolean, updated_at timestamp without time zone, is_hightlighted_old boolean, is_top_old boolean, is_highlighted boolean, is_top boolean, epoch_credits_history jsonb, epoch_stats_history jsonb, epoch_credits_history_dump jsonb, sfdp_status character varying, spy_rank numeric, earned_credits bigint, tvr double precision, mvr double precision, tvc_score double precision, tvc_rank bigint, vote_credit_ratio double precision, yield_score double precision, jiito_score double precision, jiito_score_voter double precision, jiito_score_validator double precision, is_favorite bigint, is_compare bigint, is_blocked bigint, is_notice bigint, country_iso character varying, country_iso3 character varying, country_phone_code character varying, avg_rank double precision)
            LANGUAGE plpgsql
            AS \$function\$
            BEGIN
                RETURN QUERY
                SELECT 
                    v.id,
                    v.vote_pubkey,
                    v.node_pubkey,
                    v.name,
                    v.activated_stake,
                    v.commission,
                    v.epoch_credits,
                    v.last_vote,
                    v.delinquent,
                    v.root_slot,
                    v.start_epoch,
                    v.url,
                    v.ip,
                    v.latitude,
                    v.longitude,
                    v.country,
                    v.city,
                    v.version,
                    v.superminority,
                    v.epoch_stats,
                    v.epochs_count,
                    v.has_last_epoch_stats,
                    v.avg_uptime,
                    v.avg_apy,
                    v.details,
                    v.network,
                    v.asn,
                    v.jito,
                    v.jito_commission,
                    v.avatar_file_url,
                    v.software_client,
                    v.has_screenshot,
                    v.updated_at,
                    v.is_hightlighted_old,
                    v.is_top_old,
                    v.is_highlighted,
                    v.is_top,
                    v.epoch_credits_history,
                    v.epoch_stats_history,
                    v.epoch_credits_history_dump,
                    v.sfdp_status,
                    v.spy_rank,
                    v.earned_credits,
                    v.tvr,
                    v.mvr,
                    v.tvc_score,
                    v.tvc_rank,
                    v.vote_credit_ratio,
                    v.yield_score,
                    v.jiito_score,
                    v.jiito_score_voter,
                    v.jiito_score_validator,
                    MAX(CASE WHEN v2u.type = 'favorite' THEN v2u.id ELSE NULL END) AS is_favorite,
                    MAX(CASE WHEN v2u.type = 'compare' THEN v2u.id ELSE NULL END) AS is_compare,
                    MAX(CASE WHEN v2u.type = 'blocked' THEN v2u.id ELSE NULL END) AS is_blocked,
                    MAX(CASE WHEN v2u.type = 'notice' THEN v2u.id ELSE NULL END) AS is_notice,
                    c.iso AS country_iso,
                    c.iso3 AS country_iso3,
                    c.phone_code AS country_phone_code,
                    AVG(vs.rank)::double precision AS avg_rank
                FROM data.validators v
                LEFT JOIN data.countries c ON lower(trim(both ' \n\r\t' from COALESCE(v.country, ''))) = lower(trim(both ' \n\r\t' from COALESCE(c.name, '')))
                LEFT JOIN data.validators2users v2u ON v.id = v2u.validator_id 
                    AND (p_user_id IS NULL OR v2u.user_id = p_user_id)
                LEFT JOIN data.validator_scores vs ON v.vote_pubkey = vs.vote_pubkey
                WHERE 
                    (p_search_term IS NULL OR p_search_term = '' OR 
                     lower(trim(both ' \n\r\t' from COALESCE(v.name, ''))) ILIKE ('%' || lower(trim(both ' \n\r\t' from COALESCE(p_search_term, ''))) || '%') 
                     OR lower(trim(both ' \n\r\t' from COALESCE(v.vote_pubkey, ''))) ILIKE ('%' || lower(trim(both ' \n\r\t' from COALESCE(p_search_term, ''))) || '%'))
                    AND (p_filter_type IS NULL OR p_filter_type = '' OR p_filter_type = 'all' 
                         OR (p_filter_type = 'highlight' AND v.is_highlighted = TRUE) 
                         OR (p_filter_type = 'top' AND v.is_top = TRUE)
                         OR (p_filter_type = 'favorite' AND p_user_id IS NOT NULL AND MAX(CASE WHEN v2u.type = 'favorite' THEN v2u.id ELSE NULL END) IS NOT NULL)
                         OR (p_filter_type = 'compare' AND p_user_id IS NOT NULL AND MAX(CASE WHEN v2u.type = 'compare' THEN v2u.id ELSE NULL END) IS NOT NULL)
                         OR (p_filter_type = 'blocked' AND p_user_id IS NOT NULL AND MAX(CASE WHEN v2u.type = 'blocked' THEN v2u.id ELSE NULL END) IS NOT NULL)
                         OR (p_filter_type = 'notice' AND p_user_id IS NOT NULL AND MAX(CASE WHEN v2u.type = 'notice' THEN v2u.id ELSE NULL END) IS NOT NULL))
                    AND (p_validator_ids IS NULL OR v.id = ANY(p_validator_ids))
                GROUP BY 
                    v.id, v.vote_pubkey, v.node_pubkey, v.name, v.activated_stake, v.commission, v.epoch_credits, 
                    v.last_vote, v.delinquent, v.root_slot, v.start_epoch, v.url, v.ip, v.latitude, v.longitude, 
                    v.country, v.city, v.version, v.superminority, v.epoch_stats, v.epochs_count, 
                    v.has_last_epoch_stats, v.avg_uptime, v.avg_apy, v.details, v.network, v.asn, v.jito, 
                    v.jito_commission, v.avatar_file_url, v.software_client, v.has_screenshot, v.updated_at, 
                    v.is_hightlighted_old, v.is_top_old, v.is_highlighted, v.is_top, v.epoch_credits_history, 
                    v.epoch_stats_history, v.epoch_credits_history_dump, v.sfdp_status, v.spy_rank, 
                    v.earned_credits, v.tvr, v.mvr, v.tvc_score, v.tvc_rank, v.vote_credit_ratio, 
                    v.yield_score, v.jiito_score, v.jiito_score_voter, v.jiito_score_validator, 
                    c.iso, c.iso3, c.phone_code
                ORDER BY 
                    CASE 
                        WHEN p_sort_column = 'spy_rank' THEN v.spy_rank
                        WHEN p_sort_column = 'tvc_rank' THEN v.tvc_rank
                        ELSE NULL
                    END DESC NULLS LAST,
                    CASE 
                        WHEN p_sort_column = 'name' THEN lower(trim(both ' \n\r\t' from COALESCE(v.name, '')))
                        ELSE NULL
                    END ASC,
                    CASE 
                        WHEN p_sort_column = 'id' THEN v.id
                        ELSE NULL
                    END ASC
                OFFSET p_offset LIMIT p_limit;
            END;
            \$function\$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to the previous version
        DB::statement("
            CREATE OR REPLACE FUNCTION data.search_validators(p_search_term text, p_filter_type text, p_user_id bigint, p_sort_column text, p_offset integer, p_limit integer, p_validator_ids bigint[] DEFAULT NULL::bigint[])
            RETURNS TABLE(id bigint, vote_pubkey character varying, node_pubkey character varying, name character varying, activated_stake bigint, commission double precision, epoch_credits jsonb, last_vote bigint, delinquent boolean, root_slot bigint, start_epoch bigint, url character varying, ip character varying, latitude double precision, longitude double precision, country character varying, city character varying, version character varying, superminority boolean, epoch_stats jsonb, epochs_count bigint, has_last_epoch_stats boolean, avg_uptime double precision, avg_apy double precision, details text, network character varying, asn character varying, jito boolean, jito_commission double precision, avatar_file_url character varying, software_client character varying, has_screenshot boolean, updated_at timestamp without time zone, is_hightlighted_old boolean, is_top_old boolean, is_highlighted boolean, is_top boolean, epoch_credits_history jsonb, epoch_stats_history jsonb, epoch_credits_history_dump jsonb, sfdp_status character varying, spy_rank numeric, earned_credits bigint, tvr double precision, mvr double precision, tvc_score double precision, tvc_rank bigint, vote_credit_ratio double precision, yield_score double precision, jiito_score double precision, jiito_score_voter double precision, jiito_score_validator double precision, is_favorite bigint, is_compare bigint, is_blocked bigint, is_notice bigint, country_iso character varying, country_iso3 character varying, country_phone_code character varying, avg_rank double precision)
            LANGUAGE plpgsql
            AS \$function\$
            BEGIN
                RETURN QUERY
                SELECT 
                    v.id,
                    v.vote_pubkey,
                    v.node_pubkey,
                    v.name,
                    v.activated_stake,
                    v.commission,
                    v.epoch_credits,
                    v.last_vote,
                    v.delinquent,
                    v.root_slot,
                    v.start_epoch,
                    v.url,
                    v.ip,
                    v.latitude,
                    v.longitude,
                    v.country,
                    v.city,
                    v.version,
                    v.superminority,
                    v.epoch_stats,
                    v.epochs_count,
                    v.has_last_epoch_stats,
                    v.avg_uptime,
                    v.avg_apy,
                    v.details,
                    v.network,
                    v.asn,
                    v.jito,
                    v.jito_commission,
                    v.avatar_file_url,
                    v.software_client,
                    v.has_screenshot,
                    v.updated_at,
                    v.is_hightlighted_old,
                    v.is_top_old,
                    v.is_highlighted,
                    v.is_top,
                    v.epoch_credits_history,
                    v.epoch_stats_history,
                    v.epoch_credits_history_dump,
                    v.sfdp_status,
                    v.spy_rank,
                    v.earned_credits,
                    v.tvr,
                    v.mvr,
                    v.tvc_score,
                    v.tvc_rank,
                    v.vote_credit_ratio,
                    v.yield_score,
                    v.jiito_score,
                    v.jiito_score_voter,
                    v.jiito_score_validator,
                    MAX(CASE WHEN v2u.type = 'favorite' THEN v2u.id ELSE NULL END) AS is_favorite,
                    MAX(CASE WHEN v2u.type = 'compare' THEN v2u.id ELSE NULL END) AS is_compare,
                    MAX(CASE WHEN v2u.type = 'blocked' THEN v2u.id ELSE NULL END) AS is_blocked,
                    MAX(CASE WHEN v2u.type = 'notice' THEN v2u.id ELSE NULL END) AS is_notice,
                    c.iso AS country_iso,
                    c.iso3 AS country_iso3,
                    c.phone_code AS country_phone_code,
                    AVG(vs.rank)::double precision AS avg_rank
                FROM data.validators v
                LEFT JOIN data.countries c ON lower(trim(both ' \n\r\t' from COALESCE(v.country, ''))) = lower(trim(both ' \n\r\t' from COALESCE(c.name, '')))
                LEFT JOIN data.validators2users v2u ON v.id = v2u.validator_id 
                    AND (p_user_id IS NULL OR v2u.user_id = p_user_id)
                LEFT JOIN data.validator_scores vs ON v.vote_pubkey = vs.vote_pubkey
                WHERE 
                    (p_search_term IS NULL OR p_search_term = '' OR 
                     lower(trim(both ' \n\r\t' from COALESCE(v.name, ''))) ILIKE ('%' || lower(trim(both ' \n\r\t' from COALESCE(p_search_term, ''))) || '%') 
                     OR lower(trim(both ' \n\r\t' from COALESCE(v.vote_pubkey, ''))) ILIKE ('%' || lower(trim(both ' \n\r\t' from COALESCE(p_search_term, ''))) || '%'))
                    AND (p_filter_type IS NULL OR p_filter_type = '' OR p_filter_type = 'all' 
                         OR (p_filter_type = 'highlight' AND v.is_highlighted = TRUE) 
                         OR (p_filter_type = 'top' AND v.is_top = TRUE)
                         OR (p_filter_type = 'favorite' AND p_user_id IS NOT NULL AND v2u.id IS NOT NULL AND v2u.type = 'favorite')
                         OR (p_filter_type = 'compare' AND p_user_id IS NOT NULL AND v2u.id IS NOT NULL AND v2u.type = 'compare')
                         OR (p_filter_type = 'blocked' AND p_user_id IS NOT NULL AND v2u.id IS NOT NULL AND v2u.type = 'blocked')
                         OR (p_filter_type = 'notice' AND p_user_id IS NOT NULL AND v2u.id IS NOT NULL AND v2u.type = 'notice'))
                    AND (p_validator_ids IS NULL OR v.id = ANY(p_validator_ids))
                GROUP BY 
                    v.id, v.vote_pubkey, v.node_pubkey, v.name, v.activated_stake, v.commission, v.epoch_credits, 
                    v.last_vote, v.delinquent, v.root_slot, v.start_epoch, v.url, v.ip, v.latitude, v.longitude, 
                    v.country, v.city, v.version, v.superminority, v.epoch_stats, v.epochs_count, 
                    v.has_last_epoch_stats, v.avg_uptime, v.avg_apy, v.details, v.network, v.asn, v.jito, 
                    v.jito_commission, v.avatar_file_url, v.software_client, v.has_screenshot, v.updated_at, 
                    v.is_hightlighted_old, v.is_top_old, v.is_highlighted, v.is_top, v.epoch_credits_history, 
                    v.epoch_stats_history, v.epoch_credits_history_dump, v.sfdp_status, v.spy_rank, 
                    v.earned_credits, v.tvr, v.mvr, v.tvc_score, v.tvc_rank, v.vote_credit_ratio, 
                    v.yield_score, v.jiito_score, v.jiito_score_voter, v.jiito_score_validator, 
                    c.iso, c.iso3, c.phone_code
                ORDER BY 
                    CASE 
                        WHEN p_sort_column = 'spy_rank' THEN v.spy_rank
                        WHEN p_sort_column = 'tvc_rank' THEN v.tvc_rank
                        ELSE NULL
                    END DESC NULLS LAST,
                    CASE 
                        WHEN p_sort_column = 'name' THEN lower(trim(both ' \n\r\t' from COALESCE(v.name, '')))
                        ELSE NULL
                    END ASC,
                    CASE 
                        WHEN p_sort_column = 'id' THEN v.id
                        ELSE NULL
                    END ASC
                OFFSET p_offset LIMIT p_limit;
            END;
            \$function\$;
        ");
    }
};